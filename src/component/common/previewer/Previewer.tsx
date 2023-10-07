import React, { useState } from 'react';
import styles from './Previewer.module.css';
import { toast } from 'react-toastify';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { AppState } from '@/redux/types/AppState';
import { useSelector } from 'react-redux';
import MemoizedPDFPreview from './doc/MemoizedPDFPreview';
import { CompileStatus } from '@/model/prj/compile/CompileStatus';
import { CompileQueue } from '@/model/prj/CompileQueue';
import { Options } from 'react-pdf/dist/cjs/shared/types';
import { getAccessToken } from '../cache/Cache';
import { getSrcPosition, setProjAttr } from '@/service/project/ProjectService';
import { ProjInfo } from '@/model/prj/ProjInfo';
import { QuerySrcPos } from '@/model/request/proj/query/QuerySrcPos';
import { TexFileModel } from '@/model/file/TexFileModel';

export type PreviwerProps = {
    projectId: string;
};

const Previewer: React.FC<PreviwerProps> = ({projectId}) => {

    let cachedScale = localStorage.getItem("pdf:scale:" +projectId);
    const [pdfScale, setPdfScale] = useState<number>(Number(cachedScale)??1);
    const [curPdfUrl, setCurPdfUrl] = useState<string>();
    const [compStatus, setCompStatus] = useState<CompileStatus>(CompileStatus.COMPLETE);
    const [curLogText, setCurLogText] = useState<string>('');
    const [curPreviewTab, setCurPreviewTab] = useState<string>('pdfview');
    const [curCompileQueue, setCurCompileQueue] = useState<CompileQueue>();
    const [curProjInfo, setCurProjInfo] = useState<ProjInfo>();
    const {
        pdfUrl,
        streamLogText,
        logText, tabName,
        compileStatus,
        queue,
        projAttr,
        projInfo
    } = useSelector((state: AppState) => state.proj);

    React.useEffect(() => {
        if (pdfUrl && pdfUrl.length > 0) {
            setCurPdfUrl(pdfUrl);
        }
    }, [pdfUrl]);

    React.useEffect(() => {
        setCurProjInfo(projInfo);
    }, [projInfo]);

    React.useEffect(() => {
        setCurCompileQueue(queue);
    }, [queue]);

    React.useEffect(() => {
        setPdfScale(projAttr.pdfScale);
    }, [projAttr]);

    React.useEffect(() => {
        setCompStatus(compileStatus);
    }, [compileStatus]);

    React.useEffect(() => {
        if (logText && logText === "====CLEAR====") {
            setCurLogText("");
            return;
        }
        if (logText && logText.length > 0 && logText !== "====CLEAR====") {
            setCompStatus(CompileStatus.COMPLETE);
            setCurLogText(logText);
        }
    }, [logText]);

    React.useEffect(() => {
        if (tabName && tabName.length > 0) {
            setCurPreviewTab(tabName);
        }
    }, [tabName]);

    React.useEffect(() => {
        if (streamLogText && streamLogText.length > 0) {
            if (streamLogText === "====CLEAR====") {
                setCurLogText("");
                return;
            }
            setCompStatus(CompileStatus.COMPILING);
            setCurLogText((prevState) => {
                let newLogText = (prevState && prevState.length > 0) ? prevState + "<br/>" + streamLogText : prevState + streamLogText;
                return (newLogText);
            });
        }
    }, [streamLogText]);

    const options: Options = {
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
        httpHeaders: {
            'Authorization': 'Bearer ' + getAccessToken()
        }
    };

    const handleDownloadPdf = async (pdfUrl: any) => {
        if (!pdfUrl) {
            toast.error("PDF文件Url为空");
            return;
        }
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', new Date().getTime() + '.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    }

    const handleSrcLocate = () => {
        if (!curProjInfo) {
            toast.info("项目信息为空");
            return;
        }
        const selected = localStorage.getItem("proj-select-file:" + curProjInfo.main.project_id);
        if (!selected) {
            toast.info("请选择文件");
            return;
        }
        const selectFile: TexFileModel = JSON.parse(selected);
        let req: QuerySrcPos = {
            project_id: curProjInfo?.main.project_id,
            path: selectFile.file_path,
            file: selectFile.name,
            main_file: "main.tex",
            page: 2,
            h: 3.565,
            v: 4.563
        };
        getSrcPosition(req);
    }

    const handleZoomIn = async () => {
        if (!curProjInfo || !curProjInfo.main || !curProjInfo.main.project_id) {
            toast.warn("未找到当前项目信息");
            return;
        }
        let curScale = pdfScale + 0.1;
        setProjAttr({ pdfScale: curScale });
        localStorage.setItem("pdf:scale:" + curProjInfo.main.project_id, curScale.toString());
    }

    const handleZoomOut = async () => {
        if (!curProjInfo || !curProjInfo.main || !curProjInfo.main.project_id) {
            toast.warn("未找到当前项目信息");
            return;
        }
        let curScale = pdfScale - 0.1;
        setProjAttr({ pdfScale: curScale });
        localStorage.setItem("pdf:scale:" + curProjInfo.main.project_id, curScale.toString());
    }

    const renderPreviewTab = () => {
        switch (curPreviewTab) {
            case "pdfview":
                return renderPdfView();
            case "logview":
                return renderLogView();
            default:
                return (<div></div>);
        }
    }

    const createMarkup = () => {
        let formatted = curLogText?.replace(/\n/g, '<br/>');
        return { __html: formatted };
    }

    const renderLogView = () => {
        if (compStatus === CompileStatus.WAITING) {
            return (
                <div className={styles.logLoadingContainer}>
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className={styles.logContainer}>
                <div className={styles.logContent} id="logtext" dangerouslySetInnerHTML={createMarkup()}></div>
            </div>
        );
    }

    const renderPdfView = () => {
        if (!curProjInfo || !curProjInfo.main) return <div>Loading...</div>;
        if (!pdfUrl) return <div>Loading...</div>;
        return (
            <MemoizedPDFPreview
                curPdfUrl={pdfUrl}
                projId={curProjInfo.main.project_id}
                options={options}></MemoizedPDFPreview>
        );
    }

    const renderPreviewHeaderAction = () => {
        if (curPreviewTab === "pdfview") {
            return (
                <div className={styles.rightAction}>
                    <button className={styles.previewIconButton}
                        data-bs-toggle="tooltip"
                        title="导航到源码"
                        onClick={() => { handleSrcLocate() }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <button className={styles.previewIconButton}
                        data-bs-toggle="tooltip"
                        title="下载PDF"
                        onClick={() => { handleDownloadPdf(curPdfUrl) }}>
                        <i className="fa-solid fa-download"></i>
                    </button>
                    <button className={styles.previewIconButton}
                        data-bs-toggle="tooltip"
                        title="放大"
                        id="zoominbutton" onClick={() => { handleZoomIn() }}>
                        <i className="fa fa-search-plus"></i>
                    </button>
                    <button className={styles.previewIconButton}
                        data-bs-toggle="tooltip"
                        title="缩小"
                        id="zoomoutbutton" onClick={() => { handleZoomOut() }}>
                        <i className="fa fa-search-minus"></i>
                    </button>
                </div>
            );
        }
        if (curPreviewTab === "logview") {
            return (<div></div>);
        }
        return (<div></div>);
    }

    const renderCompiled = () => {
        if (curCompileQueue && Object.keys(curCompileQueue).length > 0) {
            if (curCompileQueue.comp_result === 1) {
                return (<i className="fa-solid fa-bug text-danger"></i>);
            }
            if (curCompileQueue.comp_result === 0) {
                return (<i className="fa-solid fa-square-check text-success"></i>);
            }
        }
    }

    return (
        <div id="preview" className={styles.preview}>
            <div className={styles.previewHader}>
                <div className={styles.leftAction}>
                    <button className={styles.previewButton} onClick={() => { setCurPreviewTab("pdfview") }}>
                        <i className="fa-regular fa-file-pdf"></i> 预览
                    </button>
                    <button className={styles.previewButton} onClick={() => { setCurPreviewTab("logview") }}>
                        <i className="fa-regular fa-file-lines"></i> 日志 {renderCompiled()}
                    </button>
                </div>
                {renderPreviewHeaderAction()}
            </div>
            {renderPreviewTab()}
        </div>
    );
}

export default Previewer;