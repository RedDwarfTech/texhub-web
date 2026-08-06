import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EquationDesigner.module.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { insertTextToEditor } from "@/service/project/ProjectService";

export type EquationDesignerProps = {};

type SymbolItem = {
  label: string;
  code: string;
};

type SymbolCategory = {
  key: string;
  label: string;
  symbols: SymbolItem[];
};

const symbolCategories: SymbolCategory[] = [
  {
    key: "greek",
    label: "希腊字母",
    symbols: [
      { label: "α", code: "\\alpha" },
      { label: "β", code: "\\beta" },
      { label: "γ", code: "\\gamma" },
      { label: "δ", code: "\\delta" },
      { label: "ε", code: "\\epsilon" },
      { label: "ζ", code: "\\zeta" },
      { label: "η", code: "\\eta" },
      { label: "θ", code: "\\theta" },
      { label: "ι", code: "\\iota" },
      { label: "κ", code: "\\kappa" },
      { label: "λ", code: "\\lambda" },
      { label: "μ", code: "\\mu" },
      { label: "ν", code: "\\nu" },
      { label: "ξ", code: "\\xi" },
      { label: "π", code: "\\pi" },
      { label: "ρ", code: "\\rho" },
      { label: "σ", code: "\\sigma" },
      { label: "τ", code: "\\tau" },
      { label: "υ", code: "\\upsilon" },
      { label: "φ", code: "\\phi" },
      { label: "χ", code: "\\chi" },
      { label: "ψ", code: "\\psi" },
      { label: "ω", code: "\\omega" },
      { label: "Γ", code: "\\Gamma" },
      { label: "Δ", code: "\\Delta" },
      { label: "Θ", code: "\\Theta" },
      { label: "Λ", code: "\\Lambda" },
      { label: "Ξ", code: "\\Xi" },
      { label: "Π", code: "\\Pi" },
      { label: "Σ", code: "\\Sigma" },
      { label: "Υ", code: "\\Upsilon" },
      { label: "Φ", code: "\\Phi" },
      { label: "Ψ", code: "\\Psi" },
      { label: "Ω", code: "\\Omega" },
    ],
  },
  {
    key: "operators",
    label: "运算符",
    symbols: [
      { label: "±", code: "\\pm" },
      { label: "∓", code: "\\mp" },
      { label: "×", code: "\\times" },
      { label: "÷", code: "\\div" },
      { label: "⋅", code: "\\cdot" },
      { label: "∘", code: "\\circ" },
      { label: "∗", code: "\\ast" },
      { label: "⋆", code: "\\star" },
      { label: "⊕", code: "\\oplus" },
      { label: "⊖", code: "\\ominus" },
      { label: "⊗", code: "\\otimes" },
      { label: "⊘", code: "\\oslash" },
      { label: "⊙", code: "\\odot" },
      { label: "†", code: "\\dagger" },
      { label: "‡", code: "\\ddagger" },
      { label: "∐", code: "\\amalg" },
      { label: "∪", code: "\\cup" },
      { label: "∩", code: "\\cap" },
      { label: "⊔", code: "\\sqcup" },
      { label: "⊓", code: "\\sqcap" },
      { label: "∨", code: "\\vee" },
      { label: "∧", code: "\\wedge" },
      { label: "⋃", code: "\\bigcup" },
      { label: "⋂", code: "\\bigcap" },
    ],
  },
  {
    key: "relations",
    label: "关系符",
    symbols: [
      { label: "=", code: "=" },
      { label: "≠", code: "\\neq" },
      { label: "≡", code: "\\equiv" },
      { label: "≈", code: "\\approx" },
      { label: "∼", code: "\\sim" },
      { label: "≃", code: "\\simeq" },
      { label: "≅", code: "\\cong" },
      { label: "<", code: "<" },
      { label: ">", code: ">" },
      { label: "≤", code: "\\leq" },
      { label: "≥", code: "\\geq" },
      { label: "≪", code: "\\ll" },
      { label: "≫", code: "\\gg" },
      { label: "∝", code: "\\propto" },
      { label: "⊥", code: "\\perp" },
      { label: "∥", code: "\\parallel" },
      { label: "∈", code: "\\in" },
      { label: "∉", code: "\\notin" },
      { label: "∋", code: "\\ni" },
      { label: "⊂", code: "\\subset" },
      { label: "⊃", code: "\\supset" },
      { label: "⊆", code: "\\subseteq" },
      { label: "⊇", code: "\\supseteq" },
    ],
  },
  {
    key: "arrows",
    label: "箭头",
    symbols: [
      { label: "←", code: "\\leftarrow" },
      { label: "→", code: "\\rightarrow" },
      { label: "↔", code: "\\leftrightarrow" },
      { label: "⇐", code: "\\Leftarrow" },
      { label: "⇒", code: "\\Rightarrow" },
      { label: "⇔", code: "\\Leftrightarrow" },
      { label: "↦", code: "\\mapsto" },
      { label: "↩", code: "\\hookleftarrow" },
      { label: "↪", code: "\\hookrightarrow" },
      { label: "↼", code: "\\leftharpoonup" },
      { label: "↽", code: "\\leftharpoondown" },
      { label: "⇀", code: "\\rightharpoonup" },
      { label: "⇁", code: "\\rightharpoondown" },
      { label: "↑", code: "\\uparrow" },
      { label: "↓", code: "\\downarrow" },
      { label: "↕", code: "\\updownarrow" },
      { label: "⇑", code: "\\Uparrow" },
      { label: "⇓", code: "\\Downarrow" },
      { label: "⟶", code: "\\longrightarrow" },
      { label: "⟵", code: "\\longleftarrow" },
    ],
  },
  {
    key: "logic",
    label: "逻辑",
    symbols: [
      { label: "∀", code: "\\forall" },
      { label: "∃", code: "\\exists" },
      { label: "∄", code: "\\nexists" },
      { label: "¬", code: "\\neg" },
      { label: "∧", code: "\\land" },
      { label: "∨", code: "\\lor" },
      { label: "⊤", code: "\\top" },
      { label: "⊥", code: "\\bot" },
      { label: "⊢", code: "\\vdash" },
      { label: "⊨", code: "\\vDash" },
      { label: "∴", code: "\\therefore" },
      { label: "∵", code: "\\because" },
    ],
  },
  {
    key: "calculus",
    label: "积分/求和",
    symbols: [
      { label: "∑", code: "\\sum" },
      { label: "∏", code: "\\prod" },
      { label: "∐", code: "\\coprod" },
      { label: "∫", code: "\\int" },
      { label: "∬", code: "\\iint" },
      { label: "∭", code: "\\iiint" },
      { label: "∮", code: "\\oint" },
      { label: "∯", code: "\\oiint" },
      { label: "∰", code: "\\oiiint" },
      { label: "∂", code: "\\partial" },
      { label: "∇", code: "\\nabla" },
      { label: "∞", code: "\\infty" },
      { label: "lim", code: "\\lim" },
      { label: "sup", code: "\\sup" },
      { label: "inf", code: "\\inf" },
      { label: "max", code: "\\max" },
      { label: "min", code: "\\min" },
    ],
  },
  {
    key: "accents",
    label: "修饰",
    symbols: [
      { label: "x̂", code: "\\hat{x}" },
      { label: "x̄", code: "\\bar{x}" },
      { label: "x⃗", code: "\\vec{x}" },
      { label: "ẋ", code: "\\dot{x}" },
      { label: "ẍ", code: "\\ddot{x}" },
      { label: "x̃", code: "\\tilde{x}" },
      { label: "x́", code: "\\acute{x}" },
      { label: "x̀", code: "\\grave{x}" },
      { label: "x̌", code: "\\check{x}" },
      { label: "x̂", code: "\\widehat{x}" },
      { label: "x̲", code: "\\underline{x}" },
      { label: "x̅", code: "\\overline{x}" },
      { label: "x⃗", code: "\\overrightarrow{x}" },
      { label: "x̿", code: "\\overleftrightarrow{x}" },
    ],
  },
  {
    key: "delimiters",
    label: "括号",
    symbols: [
      { label: "(", code: "(" },
      { label: ")", code: ")" },
      { label: "[", code: "[" },
      { label: "]", code: "]" },
      { label: "{", code: "\\{" },
      { label: "}", code: "\\}" },
      { label: "⟨", code: "\\langle" },
      { label: "⟩", code: "\\rangle" },
      { label: "⌊", code: "\\lfloor" },
      { label: "⌋", code: "\\rfloor" },
      { label: "⌈", code: "\\lceil" },
      { label: "⌉", code: "\\rceil" },
      { label: "|", code: "|" },
      { label: "‖", code: "\\|" },
      { label: "/", code: "/" },
      { label: "\\", code: "\\backslash" },
      { label: "↑", code: "\\uparrow" },
      { label: "↓", code: "\\downarrow" },
    ],
  },
  {
    key: "templates",
    label: "常用模板",
    symbols: [
      { label: "分式", code: "\\frac{a}{b}" },
      { label: "根号", code: "\\sqrt{x}" },
      { label: "n次根", code: "\\sqrt[n]{x}" },
      { label: "上标", code: "^{}" },
      { label: "下标", code: "_{}" },
      { label: "上下标", code: "_{}^{}" },
      { label: "分式2", code: "\\dfrac{a}{b}" },
      { label: "二项式", code: "\\binom{n}{k}" },
      { label: "积分限", code: "\\int_{a}^{b}" },
      { label: "求和限", code: "\\sum_{i=1}^{n}" },
      { label: "极限", code: "\\lim_{x \\to \\infty}" },
      { label: "cases", code: "\\begin{cases} a & b \\\\ c & d \\end{cases}" },
      { label: "align", code: "\\begin{align} a &= b \\\\ c &= d \\end{align}" },
      { label: "matrix", code: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}" },
      { label: "pmatrix", code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "bmatrix", code: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
      { label: "vmatrix", code: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}" },
      { label: "text", code: "\\text{}" },
      { label: "space", code: "\\quad" },
      { label: "dots", code: "\\dots" },
      { label: "cdots", code: "\\cdots" },
      { label: "vdots", code: "\\vdots" },
      { label: "ddots", code: "\\ddots" },
      { label: "emptyset", code: "\\emptyset" },
      { label: "aleph", code: "\\aleph" },
      { label: "Re", code: "\\Re" },
      { label: "Im", code: "\\Im" },
      { label: "ℵ", code: "\\aleph" },
      { label: "℘", code: "\\wp" },
      { label: "ℏ", code: "\\hbar" },
      { label: "°", code: "^\\circ" },
      { label: "′", code: "\\prime" },
      { label: "…", code: "\\ldots" },
      { label: "⋯", code: "\\cdots" },
    ],
  },
];

const EquationDesigner: React.FC<EquationDesignerProps> = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("greek");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);

  const handleInsertSymbol = (symbolCode: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCode((prev) => prev + symbolCode);
      return;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = code.slice(0, start);
    const after = code.slice(end);
    const newCode = before + symbolCode + after;
    setCode(newCode);

    // 将光标定位到插入代码中第一个 `{` 之后，方便用户填写参数
    const firstBrace = symbolCode.indexOf("{");
    const braceCount = symbolCode.split("{").length - 1;
    let newCursor = start + symbolCode.length;
    if (firstBrace !== -1 && braceCount > 0) {
      newCursor = start + firstBrace + 1;
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
      setCursorPos(newCursor);
    }, 0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setCursorPos(e.target.selectionStart ?? 0);
  };

  const handleInsertToEditor = () => {
    if (!code.trim()) {
      toast.warn(t("tips_input_snippet") || "请输入公式代码");
      return;
    }
    // 默认插入行内公式 $...$，如果用户代码已包含则不再包裹
    let finalCode = code;
    if (!finalCode.trim().startsWith("$") && !finalCode.trim().startsWith("\\begin{")) {
      finalCode = `$${finalCode}$`;
    }
    insertTextToEditor(finalCode);
  };

  const renderCategoryTabs = () => {
    return (
      <div className={styles.categoryTabs}>
        {symbolCategories.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.categoryTab} ${activeCategory === cat.key ? styles.activeTab : ""}`}
            onClick={() => setActiveCategory(cat.key)}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </div>
    );
  };

  const renderSymbolGrid = () => {
    const category = symbolCategories.find((c) => c.key === activeCategory);
    if (!category) return null;
    return (
      <div className={styles.symbolGrid}>
        {category.symbols.map((sym, idx) => (
          <button
            key={`${category.key}-${idx}`}
            className={styles.symbolBtn}
            title={sym.code}
            onClick={() => handleInsertSymbol(sym.code)}
            type="button"
          >
            {sym.label}
          </button>
        ))}
      </div>
    );
  };

  const renderPreview = () => {
    if (!code) return null;
    return (
      <div className={styles.codeShow}>
        <SyntaxHighlighter language="latex" style={dark}>
          {code}
        </SyntaxHighlighter>
        <div className={styles.codeActions}>
          <button className="btn btn-primary btn-sm">
            <span className="me-1">{t("btn_copy")}</span>
            <CopyToClipboard
              text={code}
              onCopy={() => {
                toast.info(t("tips_code_copied"));
              }}
            >
              <i className="fa fa-copy" style={{ cursor: "pointer" }} />
            </CopyToClipboard>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="modal fade"
      id="equationDesignerModal"
      aria-labelledby="equationDesignerLabel"
      aria-hidden="true"
    >
      <div className={`modal-dialog ${styles.equationDialog}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="equationDesignerLabel">
              {t("title_equation_designer")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {renderCategoryTabs()}
            {renderSymbolGrid()}
            <hr />
            <div className={styles.editorArea}>
              <label className={styles.areaLabel}>LaTeX</label>
              <textarea
                ref={textareaRef}
                className={`form-control ${styles.codeTextarea}`}
                rows={4}
                value={code}
                onChange={handleCodeChange}
                onKeyUp={() => {
                  if (textareaRef.current) {
                    setCursorPos(textareaRef.current.selectionStart ?? 0);
                  }
                }}
                onClick={() => {
                  if (textareaRef.current) {
                    setCursorPos(textareaRef.current.selectionStart ?? 0);
                  }
                }}
                placeholder={t("tips_input_snippet") || "输入或点击上方符号构建公式"}
              />
            </div>
            {renderPreview()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleInsertToEditor}
              data-bs-dismiss="modal"
            >
              {t("btn_confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquationDesigner;
