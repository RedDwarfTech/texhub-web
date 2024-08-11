import { LanguageDescription, LanguageSupport } from "@codemirror/language";

export const languages: LanguageDescription[] = [
  LanguageDescription.of({
    name: "latex",
    extensions: [
      "tex",
      "sty",
      "cls",
      "clo",
      "bst",
      "bbl",
      "pdf_tex",
      "pdf_t",
      "map",
      "fd",
      "enc",
      "def",
      "mf",
      "pgf",
      "tikz",
      "bbx",
      "cbx",
      "dbx",
      "lbx",
      "lco",
      "ldf",
      "xmpdata",
      "Rnw",
      "rnw",
      "lyx",
      "inc",
      "dtx",
      "hak",
      "eps_tex",
      "brf",
      "ins",
      "hva",
      "Rtex",
      "rtex",
      "pstex",
      "pstex_t",
      "gin",
      "fontspec",
      "pygstyle",
      "pygtex",
      "ps_tex",
      "ltx",
    ],
    load: (): Promise<LanguageSupport> => {
      // 根据扩展名匹配成功文件才会进入load方法
      var result = import("./latex").then((m) => {
        return m.latex();
      });
      return result;
    },
  }),
];
