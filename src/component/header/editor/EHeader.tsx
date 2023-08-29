import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from 'react-toastify';
import { compileProject, doCompilePreCheck } from "@/service/project/ProjectService";
import { ResponseHandler } from "rdjs-wheel";
import { useNavigate } from "react-router-dom";
import { CompileProjReq } from "@/model/request/proj/CompileProjReq";
import { EventSourcePolyfill } from "event-source-polyfill";

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

    const handleCompile = (mainFile: TexFileModel) => {
        toast.info("trigger compile");
        if (!mainFile) {
            toast.error("file is null");
        }
        let params = {
            project_id: mainFile.project_id,
            req_time: new Date().getTime(),
            file_name: mainFile.name
        };
        compileProject(params).then((resp) => {
            if (ResponseHandler.responseSuccess(resp)) {

            } else {
                toast.error(resp.msg);
            }
        });
    }

    const onSseMessage = (msg: string, eventSource: EventSourcePolyfill) => {
        console.log("sse: {}",msg);
    }

    const handleStreamCompile = (mainFile: TexFileModel) => {
        if (!mainFile) {
            toast.error("file is null");
        }
        let params :CompileProjReq= {
            project_id: mainFile.project_id,
            req_time: new Date().getTime(),
            file_name: mainFile.name
        };
        doCompilePreCheck(params, onSseMessage);
    }

    if (!mainFile) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.actions}>
                <button type="button" className="btn btn-primary" onClick={() => { navigate('/doc/tab') }}>个人中心</button>
                <button type="button" className="btn btn-primary" onClick={() => { handleCompile(mainFile) }}>编译</button>
                <button type="button" className="btn btn-primary" onClick={() => { handleStreamCompile(mainFile) }}>编译Stream</button>
            </div>
        </div>
    );
}

export default EHeader;