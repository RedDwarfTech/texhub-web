import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from 'react-toastify';
import {
    clearCompLogText,
    compileProjectLog,
    doCompileLogPreCheck as getStreamLog,
    getCompQueueStatus,
    sendQueueCompileRequest, setCompileStatus, showPreviewTab, updateLogText
} from "@/service/project/ProjectService";
import { useNavigate } from "react-router-dom";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { ResponseHandler } from "rdjs-wheel";
import { CompileStatus } from "@/model/prj/compile/CompileStatus";
import { getAccessToken } from "@/component/common/cache/Cache";
import ProjSetting from "@/page/main/setting/ProjSetting";

const EHeader: React.FC = () => {

    const { fileTree } = useSelector((state: AppState) => state.file);
    const { queue, projInfo } = useSelector((state: AppState) => state.proj);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    React.useEffect(() => {
        if (projInfo && Object.keys(projInfo).length > 0) {
            setMainFile(projInfo.main_file);
        }
    }, [projInfo]);

    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (queue && Object.keys(queue).length > 0) {
            if (queue.comp_status === CompileStatus.WAITING) {
                if(interval === null) {
                    interval = setInterval(() => {
                        getCompQueueStatus(queue.id);
                    }, 5000);
                }
            }
            if (queue.comp_status !== 0 && interval) {
                clearInterval(interval);
                return;
            }
            if (!mainFile) {
                return;
            }
            let req: CompileProjLog = {
                project_id: mainFile.project_id,
                file_name: mainFile.name,
                version_no: queue.version_no,
                qid: queue.id,
                access_token: getAccessToken()
            };
            if (queue.comp_status == CompileStatus.COMPILING) {
                clearCompileCheck(interval);
                getStreamLog(req, onSseMessage);
            }
            if (queue.comp_status === CompileStatus.COMPLETE) {
                clearCompileCheck(interval);
                compileProjectLog(req);
            }
            return () => {
                clearCompileCheck(interval);
            };
        }
    }, [queue]);

    const clearCompileCheck = (interval: NodeJS.Timeout | null) => {
        if (interval) {
            clearInterval(interval);
        }
    }

    const handleQueueCompile = (mainFile: TexFileModel) => {
        if (!mainFile) {
            toast.error("file is null");
        }
        let req: CompileQueueReq = {
            project_id: mainFile.project_id
        };
        sendQueueCompileRequest(req).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                showPreviewTab("logview");
                setCompileStatus(CompileStatus.WAITING);
                clearCompLogText("====CLEAR====");
            }
        });
    }

    const handleSettings = (mainFile: TexFileModel) => {

    }

    const onSseMessage = (msg: string, eventSource: EventSource) => {
        updateLogText(msg);
    }

    if (!mainFile) {
        return <div>Loading...</div>
    }

    const handleNavProfile = () => {
        navigate('/doc/tab');
    }

    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.actions}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { handleQueueCompile(mainFile) }}>
                    <i className="fa-solid fa-play"></i> 编译
                </button>
                <button type="button"
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasExample"
                    aria-controls="offcanvasExample"
                    onClick={() => { handleSettings(mainFile) }}>
                    <i className="fa-solid fa-cog"></i> 设置
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { handleNavProfile() }}>
                    <i className="fa-solid fa-user"></i> 个人中心
                </button>
            </div>
            <ProjSetting></ProjSetting>
        </div>
    );
}

export default EHeader;