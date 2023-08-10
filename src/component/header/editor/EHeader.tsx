import { useSelector } from "react-redux";
import styles from "./EHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast, ToastContainer } from 'react-toastify';

const EHeader: React.FC = () => {

    const { fileTree } = useSelector((state: AppState) => state.file);
    const [mainFile, setMainFile] = useState<TexFileModel>();

    React.useEffect(() => {
        if (fileTree && fileTree.length > 0) {
            let defaultFile = fileTree.filter((file: TexFileModel) => file.main_flag === 1);
            setMainFile(defaultFile[0]);
        }
    }, [fileTree]);

    const handleCompile = (mainFile: TexFileModel) => {
        toast.info("trigger compile");
    }

    if (!mainFile) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <div></div>
            <div className={styles.actions}>
                <button onClick={() => { handleCompile(mainFile) }}>编译</button>
            </div>
        </div>
    );
}

export default EHeader;