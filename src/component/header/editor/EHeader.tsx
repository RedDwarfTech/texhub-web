import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from 'react-toastify';
import { clearCompLogText, doCompilePreCheck, getTempAuthCode, sendCompileRequest, updateLogText } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import {  CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CompileProjReq } from "@/model/request/proj/CompileProjReq copy";

const EHeader: React.FC = () => {

    const { fileTree } = useSelector((state: AppState) => state.file);
    const [mainFile, setMainFile] = useState<TexFileModel>();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    const handleQueueCompile = (mainFile: TexFileModel) => {
        toast.info("编译请求已发送");
        if (!mainFile) {
            toast.error("file is null");
        }
        let req: CompileQueueReq = {
            project_id: mainFile.project_id
        };
        sendCompileRequest(req);
    }

    const onSseMessage = (msg: string, eventSource: EventSource) => {
        updateLogText(msg);
    }

    const handleStreamCompile = (mainFile: TexFileModel) => {
        if (!mainFile) {
            toast.error("file is null");
        }
        clearCompLogText('clear');
        getTempAuthCode().then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {
                let params: CompileProjReq = {
                    project_id: mainFile.project_id,
                    req_time: new Date().getTime(),
                    file_name: mainFile.name,
                    tac: resp.result
                };
                doCompilePreCheck(params, onSseMessage);
            }
        });
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