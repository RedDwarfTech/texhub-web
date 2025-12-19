import { useSelector } from "react-redux";
import styles from "./AppHeader.module.css";
import { AppState } from "@/redux/types/AppState";
import React, { useState } from "react";
import { TexFileModel } from "@/model/file/TexFileModel";
import { toast } from "react-toastify";
import {
  clearCompLogText,
  compileProjectLog,
  getStreamLog,
  getCompQueueStatus,
  sendQueueCompileRequest,
  setContextCompileStatus,
  showPreviewTab,
  projHistoryPage,
} from "@/service/project/ProjectService";
import { useNavigate } from "react-router-dom";
import { CompileQueueReq } from "@/model/request/proj/CompileQueueReq";
import { CompileProjLog } from "@/model/request/proj/CompileProjLog";
import { ResponseHandler, SSEMessage } from "rdjs-wheel";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { getAccessToken } from "@/component/common/cache/Cache";
import ProjSetting from "@/page/main/setting/ProjSetting";
import TeXShare from "@/page/profile/project/share/TeXShare";
import { useTranslation } from "react-i18next";
import ProjHistory from "@/page/main/history/ProjHistory";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { setContextCompileResultType } from "@/service/project/preview/PreviewService";
import { defaultHistoryPageSize } from "@/config/app/global-conf.js";

const EHeader: React.FC = () => {
  const { fileTree } = useSelector((state: AppState) => state.file);
  const { texQueue, projInfo } = useSelector((state: AppState) => state.proj);
  const [mainFile, setMainFile] = useState<TexFileModel>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const prevCompStatusRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (fileTree && fileTree.length > 0) {
      let defaultFile = fileTree.filter(
        (file: TexFileModel) => file.main_flag === 1
      );
      setMainFile(defaultFile[0]);
    }
  }, [fileTree]);

  React.useEffect(() => {
    if (projInfo && Object.keys(projInfo).length > 0) {
      setMainFile(projInfo.main_file);
    }
  }, [projInfo]);

  React.useEffect(() => {
    if (!mainFile) return;

    if (!texQueue || Object.keys(texQueue).length === 0) return;

    const req: CompileProjLog = {
      project_id: mainFile.project_id,
      file_name: mainFile.name,
      version_no: texQueue.version_no,
      qid: texQueue.id,
      access_token: getAccessToken(),
    };

    // WAITING: start polling status every 5s (only once)
    if (texQueue.comp_status === CompileStatus.WAITING) {
      if (intervalRef.current === null) {
        intervalRef.current = setInterval(() => {
          getCompQueueStatus(texQueue.id);
        }, 5000);
      }
    } else {
      // clear polling if it's running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Start streaming only when status transitions into COMPILING
    if (texQueue.comp_status === CompileStatus.COMPILING) {
      if (prevCompStatusRef.current !== CompileStatus.COMPILING) {
        getStreamLog(req);
      }
    } else if (texQueue.comp_status === CompileStatus.COMPLETE) {
      compileProjectLog(req);
    }

    prevCompStatusRef.current = texQueue.comp_status;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [texQueue, mainFile]);

  const clearCompileCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleQueueCompile = (mainFile: TexFileModel) => {
    if (!mainFile) {
      toast.error("file is null");
      return;
    }
    let req: CompileQueueReq = {
      project_id: mainFile.project_id,
    };
    sendQueueCompileRequest(req).then((res) => {
      if (ResponseHandler.responseSuccess(res)) {
        showPreviewTab("logview");
        setContextCompileStatus(CompileStatus.WAITING);
        setContextCompileResultType(CompileResultType.PROCESSING);
        let msg: SSEMessage = {
          data: "====CLEAR====",
        };
        clearCompLogText(new Array<SSEMessage>().concat(msg));
      }
    });
  };

  const handleSettings = (mainFile: TexFileModel) => {};

  const showProjHistory = (mainFile: TexFileModel) => {
    const hist: QueryHistory = {
      project_id: mainFile.project_id,
      page_size: defaultHistoryPageSize
    };
    projHistoryPage(hist);
  };

  if (!mainFile) {
    return <div>Loading...</div>;
  }

  const handleNavProfile = () => {
    navigate("/doc/tab");
  };

  return (
    <div className={styles.container}>
      <div>
        <TeXShare projectId={mainFile.project_id}></TeXShare>
        <ProjHistory projectId={mainFile.project_id}></ProjHistory>
        <ProjSetting></ProjSetting>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            handleQueueCompile(mainFile);
          }}
        >
          <i className="fa-solid fa-play"></i> {t("btn_compile")}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#sharePrj"
          onClick={() => {}}
        >
          <i className="fa-solid fa-share-nodes"></i> {t("btn_share")}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          data-bs-toggle="offcanvas"
          data-bs-target="#projHistory"
          aria-controls="offcanvasExample"
          onClick={() => {
            showProjHistory(mainFile);
          }}
        >
          <i className="fa-solid fa-timeline"></i> {t("btn_history")}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasExample"
          aria-controls="offcanvasExample"
          onClick={() => {
            handleSettings(mainFile);
          }}
        >
          <i className="fa-solid fa-cog"></i> {t("btn_settings")}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            handleNavProfile();
          }}
        >
          <i className="fa-solid fa-user"></i> {t("projects")}
        </button>
      </div>
    </div>
  );
};

export default EHeader;
