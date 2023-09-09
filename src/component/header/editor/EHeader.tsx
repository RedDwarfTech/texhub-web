import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from 'react-toastify';
import {
    doCompileLogPreCheck,
    getCompQueueStatus,
    sendQueueCompileRequest, showPreviewTab, updateLogText
} from "@/service/project/ProjectService";
import { useNavigate } from "react-router-dom";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { ResponseHandler } from "rdjs-wheel";

const EHeader: React.FC = () => {

    const { fileTree } = useSelector((state: AppState) => state.file);
    const { queue } = useSelector((state: AppState) => state.proj);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

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
            if (queue.comp_status === 1) {
                if (!mainFile) {
                    return;
                }
                let req: CompileProjLog = {
                    project_id: mainFile.project_id,
                    file_name: "main.tex",
                    version_no: queue.version_no
                };
                doCompileLogPreCheck(req, onSseMessage);
            }
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
    }, [queue]);

    const handleQueueCompile = (mainFile: TexFileModel) => {
        toast.info("编译请求已提交");
        if (!mainFile) {
            toast.error("file is null");
        }
        let req: CompileQueueReq = {
            project_id: mainFile.project_id
        };
        sendQueueCompileRequest(req).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                showPreviewTab("logview");
            }
        });
    }

    const onSseMessage = (msg: string, eventSource: EventSource) => {
        updateLogText(msg);
    }

    if (!mainFile) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.actions}>
                <button type="button" className="btn btn-primary" onClick={() => { navigate('/doc/tab') }}>个人中心</button>
                <button type="button" className="btn btn-primary" onClick={() => { handleQueueCompile(mainFile) }}>编译</button>
            </div>
        </div>
    );
}

export default EHeader;