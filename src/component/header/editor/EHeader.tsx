import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from 'react-toastify';
import {
    clearCompLogText,
    compileProjectLog,
    doCompileLogPreCheck,
    getCompQueueStatus,
    sendQueueCompileRequest, setCompileStatus, showPreviewTab, updateLogText
} from "@/service/project/ProjectService";
import { useNavigate } from "react-router-dom";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { ResponseHandler } from "rdjs-wheel";
import { CompileStatus } from "@/model/prj/compile/CompileStatus";

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
            if (queue.comp_status === 0) {
                interval = setInterval(() => {
                    getCompQueueStatus(queue.id);
                }, 5000);
            }
            if (queue.comp_status !== 0 && interval) {
                clearInterval(interval);
            }
            if (!mainFile) {
                return;
            }
            let req: CompileProjLog = {
                project_id: mainFile.project_id,
                file_name: mainFile.name,
                version_no: queue.version_no
            };
            if (queue.comp_status === 1) {
                doCompileLogPreCheck(req, onSseMessage);
            }
            if (queue.comp_status === 2) {
                compileProjectLog(req);
            }
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
    }, [queue]);

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
                <button type="button" className="btn btn-primary btn-sm" onClick={() => {handleNavProfile() }}>
                    <i className="fa-solid fa-user"></i> 个人中心
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { handleQueueCompile(mainFile) }}>
                    <i className="fa-solid fa-play"></i> 编译
                </button>
            </div>
        </div>
    );
}

export default EHeader;