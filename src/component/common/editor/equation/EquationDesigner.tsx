import React from "react";

export type EquationDesignerProps = {};

const EquationDesigner: React.FC<EquationDesignerProps> = (
  props: EquationDesignerProps
) => {
  return (
    <div
      className="modal fade"
      id="equationDesignerModal"
      aria-labelledby="equationDesignerLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="tableDesignerLabel">
              公式设计器(Alpha)
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <a target="_blank" rel="noreferrer" href="https://www.latexlive.com/home">妈咪叔公式设计器</a>
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

export default EquationDesigner;
