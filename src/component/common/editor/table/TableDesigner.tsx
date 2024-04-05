import { ReactComponent as PlusColumnBefore } from "@/assets/icon/table-column-plus-before.svg";
import { ReactComponent as PlusColumnAfter } from "@/assets/icon/table-column-plus-after.svg";
import { ReactComponent as PlusColumnRemove } from "@/assets/icon/table-column-remove.svg";
import { ReactComponent as PlusRowBefore } from "@/assets/icon/table-row-plus-before.svg";
import { ReactComponent as PlusRowAfter } from "@/assets/icon/table-row-plus-after.svg";
import { ReactComponent as PlusRowRemove } from "@/assets/icon/table-row-remove.svg";
import { ReactComponent as BorderBottom } from "@/assets/icon/border-bottom.svg";
import { ReactComponent as BorderTop } from "@/assets/icon/border-top.svg";
import { ReactComponent as BorderLeft } from "@/assets/icon/border-left.svg";
import { ReactComponent as BorderRight } from "@/assets/icon/border-right.svg";
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

export type TableDesignerProps = {};

const TableDesigner: React.FC<TableDesignerProps> = (
  props: TableDesignerProps
) => {
    const [code, setCode] = useState<string>('');
  const jRef = useRef<JspreadsheetInstanceElement>(null);
  const options: JSpreadsheetOptions = {
    data: [[]],
    minDimensions: [2, 2],
  };

  React.useEffect(() => {
    if (jRef.current) {
      if (!jRef.current.jspreadsheet) {
        jspreadsheet(jRef.current, options);
      }
    }
  }, [options]);

  const addRow = () => {
    if (jRef.current) {
      jRef.current.jexcel.insertRow();
    }
  };

  const deleteRow = () => {
    if (jRef.current) {
      jRef.current.jexcel.deleteRow();
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
        const rowNum = spreadsheet.row.length;
        let latexCode = "\\begin{table}\n";
        latexCode += "\\centering\n";
        latexCode += "\\begin{tabular}{";
        
        // 添加列对齐方式
        for (let i = 0; i < colNum; i++) {
          latexCode += "c";
        }
  
        latexCode += "}\n";
        latexCode += "\\hline\n";
        debugger
        for (let i = 0; i < rowNum; i++) {
           // const curRowData = data[i]?data[i]:" ";
          // latexCode += curRowData.join(" & ") + " \\\\ \\hline\n";
        }
  
        latexCode += "\\end{tabular}\n";
        latexCode += "\\end{table}";
  
        setCode(latexCode); 
      }
  }

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
                onClick={()=>{
                    handleTeXTableCodeGeneration();
                }}
              >
                生成LaTeX代码
              </button>
            </div>
            <div className={styles.codeShow}>
              <SyntaxHighlighter language="latex" style={dark}>
                {code}
              </SyntaxHighlighter>
            </div>
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
