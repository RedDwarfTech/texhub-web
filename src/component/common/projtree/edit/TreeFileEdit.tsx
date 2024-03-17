import { TexFileModel } from "@/model/file/TexFileModel";
import { TreeFileType } from "@/model/file/TreeFileType";

export type TreeFileEditProps = {
    projectId: string;
};

const TreeFileEdit: React.FC<TreeFileEditProps> = (props: TreeFileEditProps) => {

    const handleOk = () => {
        console.log("working...");
    }

    const renderFolderTree = () => {
        let projTree = localStorage.getItem('projTree:' + props.projectId);
        if (projTree == null) {
            return;
        }
        let treeNodes: TexFileModel[] = JSON.parse(projTree);
        let projFolderTree = treeNodes.filter((node) => node.file_type == TreeFileType.Folder);
        const tagList: JSX.Element[] = [];
        for (let i = 1; i <= projFolderTree.length; i++) {
            tagList.push(
                <option selected>{projFolderTree[i].name}</option>
            );
        }
        return tagList;
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
                        <select className="form-select" aria-label="Default select example">
                            <option selected>/</option>
                            {renderFolderTree()}
                        </select>
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
