import { QueryProjReq } from "@/model/request/proj/query/QueryProjReq";
import { ArchiveProjReq } from "@/model/request/proj/edit/ArchiveProjReq";
import { archiveProj, getProjectList } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useRef } from "react";
import { toast } from "react-toastify";

export type DownloadProps = {
    projectId: string;
    currProject: any;
    getProjFilter: (query: QueryProjReq) => QueryProjReq;
};

const TeXDownload: React.FC<DownloadProps> = (props: DownloadProps) => {

    const archiveProjCancelRef = useRef<HTMLButtonElement>(null);
    const currProject = props.currProject;

    const handleProjArchive = () => {
        if (!currProject || !currProject.project_id) {
            toast.info("请选择编辑项目");
            return;
        }
        let proj: ArchiveProjReq = {
            project_id: currProject?.project_id,
            archive_status: 1
        };
        archiveProj(proj).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                getProjectList(props.getProjFilter({}));
                if (archiveProjCancelRef && archiveProjCancelRef.current) {
                    archiveProjCancelRef.current.click();
                }
            } else {
                toast.error("归档项目失败，{}", resp.msg);
            }
        });
    }

    return (
        <div>
            <div className="modal" id="downloadProj" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">下载项目</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>确定归档项目？</div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={archiveProjCancelRef} className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-primary" onClick={() => { handleProjArchive() }}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeXDownload;