import PlusColumnBefore from "@/assets/icon/table-column-plus-before.svg?react";
import PlusColumnAfter from "@/assets/icon/table-column-plus-after.svg?react";
import PlusColumnRemove from "@/assets/icon/table-column-remove.svg?react";
import PlusRowBefore from "@/assets/icon/table-row-plus-before.svg?react";
import PlusRowAfter from "@/assets/icon/table-row-plus-after.svg?react";
import PlusRowRemove from "@/assets/icon/table-row-remove.svg?react";
import BorderBottom from "@/assets/icon/border-bottom.svg?react";
import BorderTop from "@/assets/icon/border-top.svg?react";
import BorderLeft from "@/assets/icon/border-left.svg?react";
import BorderRight from "@/assets/icon/border-right.svg?react";
import styles from "./TableDesigner.module.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jspreadsheet, {
  JSpreadsheetOptions,
  JspreadsheetInstanceElement,
} from "jspreadsheet-ce";
import { useRef } from "react";
import React from "react";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { useState } from "react";
import TexFileUtil from "@/common/TexFileUtil";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

export type TableDesignerProps = {};

const options: JSpreadsheetOptions = {
  data: [[]],
  minDimensions: [2, 2],
};

const TableDesigner: React.FC<TableDesignerProps> = (
  props: TableDesignerProps
) => {
  const [code, setCode] = useState<string>("");
  const [rowsCount, setRowsCount] = useState<number>(2);
  const jRef = useRef<JspreadsheetInstanceElement>(null);

  React.useEffect(() => {
    if (jRef.current) {
      if (!jRef.current.jspreadsheet) {
        jspreadsheet(jRef.current, options);
      }
    }
  }, []);

  const addRow = () => {
    if (jRef.current) {
      jRef.current.jexcel.insertRow();
      setRowsCount(rowsCount + 1);
    }
  };

  const deleteRow = () => {
    if (jRef.current) {
      jRef.current.jexcel.deleteRow();
      setRowsCount(rowsCount - 1);
    }
  };

  const addCol = () => {
    if (jRef.current) {
      jRef.current.jexcel.insertColumn();
    }
  };

  const deleteCol = () => {
    if (jRef.current) {
      jRef.current.jexcel.deleteColumn();
    }
  };

  const handleTeXTableCodeGeneration = () => {
    if (jRef.current) {
      const spreadsheet = jspreadsheet(jRef.current);
      const colNum = spreadsheet.getColumnOptions.length;
      const latexCode = TexFileUtil.genTeXTableCode(rowsCount, colNum);
      setCode(latexCode);
    }
  };

  const renderCodePreview = () => {
    if (code == null || code.length === 0) return;
    return (
      <div className={styles.codeShow}>
        <SyntaxHighlighter language="latex" style={dark}>
          {code}
        </SyntaxHighlighter>
        <button className="btn btn-primary">
          <span className="m-1 pb-1 basis-3/4 text-xs">{"复制"}</span>
          <CopyToClipboard
            text={code}
            onCopy={() => {
              toast.info("代码已复制");
            }}
          >
            <i className="fa fa-copy"></i>
          </CopyToClipboard>
        </button>
      </div>
    );
  };

  return (
    <div
      className="modal fade"
      id="tableDesignerModal"
      aria-labelledby="tableDesignerLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="tableDesignerLabel">
              表格设计器
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className={styles.tableAction}>
              <table>
                <tr>
                  <th>
                    <PlusRowBefore
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        addRow();
                      }}
                    ></PlusRowBefore>
                  </th>
                  <th>
                    <PlusRowAfter
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        addRow();
                      }}
                    ></PlusRowAfter>
                  </th>
                  <th>
                    <PlusRowRemove
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        deleteRow();
                      }}
                    ></PlusRowRemove>
                  </th>
                </tr>
              </table>
              <table>
                <tr>
                  <th>
                    <PlusColumnBefore
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        addCol();
                      }}
                    ></PlusColumnBefore>
                  </th>
                  <th>
                    <PlusColumnAfter
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        addCol();
                      }}
                    ></PlusColumnAfter>
                  </th>
                  <th>
                    <PlusColumnRemove
                      width={"20px"}
                      height={"20px"}
                      onClick={() => {
                        deleteCol();
                      }}
                    ></PlusColumnRemove>
                  </th>
                </tr>
              </table>
              <table>
                <tr>
                  <th>
                    <BorderBottom width={"20px"} height={"20px"}></BorderBottom>
                  </th>
                  <th>
                    <BorderTop width={"20px"} height={"20px"}></BorderTop>
                  </th>
                  <th>
                    <BorderLeft width={"20px"} height={"20px"}></BorderLeft>
                  </th>
                  <th>
                    <BorderRight width={"20px"} height={"20px"}></BorderRight>
                  </th>
                </tr>
              </table>
            </div>
            <hr />
            <div ref={jRef} className={styles.jspredsheet} />
            <hr />
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleTeXTableCodeGeneration();
                }}
              >
                生成LaTeX代码
              </button>
            </div>
            {renderCodePreview()}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={() => {}}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDesigner;
