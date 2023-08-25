import { readConfig } from "@/config/app/config-reader";
import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { writeText } from 'clipboard-polyfill';

export type ShareProps = {
    projectId: string;
};

const TeXShare: React.FC<ShareProps> = (props: ShareProps) => {

    const [projShareLink, setProjShareLink] = useState<string>();

    React.useEffect(() => {
        let shareLink = readConfig("shareBaseUrl") + "?projectId=" + props.projectId;
        setProjShareLink(shareLink);
    }, []);

    const handleShareLinkCopy = () => {
        if(!props.projectId || props.projectId.length === 0) {
            toast.error("项目ID获取失败");
            return ;
        }
        if (!projShareLink || projShareLink.length === 0) {
            toast.error("分享链接生成异常");
            return;
        }
        writeText(projShareLink)
            .then(() => {
                toast.success("拷贝成功");
            })
            .catch((error) => {
                toast.error('Failed to copy:', error);
            });
    }

    return (
        <div>
            <div className="modal" id="sharePrj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">分享项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>分享链接：</div>
                            <div>{projShareLink}</div>
                            <button type="button" className="btn btn-primary" onClick={() => { handleShareLinkCopy() }}>拷贝</button>
                        </div>
                        <div className="modal-footer">
                            {/**<button type="button" ref={editProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjEdit() }}>确定</button>**/}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXShare;