export type TreeFileEditProps = {
    projectId: string;
};

const TreeFileEdit: React.FC<TreeFileEditProps> = (props: TreeFileEditProps) => {

    const handleOk = () => {
        console.log("working...");
    }

    return (
        <div className="modal fade" id="moveFileModal" aria-labelledby="moveModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="moveModalLabel">移动到文件夹</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleOk() }}>确定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TreeFileEdit;
