import { TexFileModel } from "@/model/file/TexFileModel";
import { QueryProjInfo } from "@/model/request/proj/query/QueryProjInfo";
import { AppState } from "@/redux/types/AppState";
import { getProjectInfo, uploadProjectFile } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export type TreeUploadProps = {
    projectId: string;
};

const TreeUpload: React.FC<TreeUploadProps> = (props: TreeUploadProps) => {

    const fileInput = React.createRef<HTMLInputElement>();
    const { selectItem } = useSelector((state: AppState) => state.file);
    const selected = localStorage.getItem("proj-select-file:" + props.projectId);
    const [selectedFile, setSelectedFile] = useState<TexFileModel>(selected ? JSON.parse(selected) : null);

    React.useEffect(() => {
        setSelectedFile(selectItem);
    }, [selectItem]);

    const handleOk = () => {
        if (fileInput && fileInput.current && fileInput.current.files && fileInput.current.files.length > 0) {
            const uploadFile = fileInput.current?.files[0];
            console.log(uploadFile);
            if (!selectedFile || selectedFile.file_id == undefined) {
                toast.warn("请选择文件上传位置");
                return;
            }
            if(uploadFile.size)
            uploadProjectFile(uploadFile, props.projectId, selectedFile.file_id).then((res) => {
                if (ResponseHandler.responseSuccess(res)) {
                    let query: QueryProjInfo = {
                        project_id: props.projectId
                    };
                    getProjectInfo(query);
                }
            });
        }
    }

    return (
        <div className="modal fade" id="uploadFileModal" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="uploadModalLabel">上传文件</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <input className="form-control form-control-md" id="formFileLg" ref={fileInput} type="file" />
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

export default TreeUpload;