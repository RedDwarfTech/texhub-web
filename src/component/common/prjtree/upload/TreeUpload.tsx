import { uploadProjectFile } from "@/service/project/ProjectService";
import React from "react";

const TreeUpload: React.FC = () => {

    const fileInput = React.createRef<HTMLInputElement>();

    const handleOk = () => {
        if (fileInput && fileInput.current && fileInput.current.files && fileInput.current.files.length > 0) {
            const selectedFile = fileInput.current?.files[0];
            console.log(selectedFile);
            uploadProjectFile(selectedFile);
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