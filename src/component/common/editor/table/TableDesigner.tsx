
export type TableDesignerProps = {

};

const TableDesigner: React.FC<TableDesignerProps> = (props: TableDesignerProps) => {

    return (
        <div className="modal fade" id="tableDesignerModal" aria-labelledby="tableDesignerLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="tableDesignerLabel">表格设计器</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            表格设计器
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => {  }}>确定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableDesigner;