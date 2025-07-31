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
import { ResponseHandler } from "rdjs-wheel";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { getAccessToken } from "@/component/common/cache/Cache";
import ProjSetting from "@/page/main/setting/ProjSetting";
import TeXShare from "@/page/profile/project/share/TeXShare";
import { useTranslation } from "react-i18next";
import ProjHistory from "@/page/main/history/ProjHistory";
import { QueryHistory } from "@/model/request/proj/query/QueryHistory";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { setContextCompileResultType } from "@/service/project/preview/PreviewService";

const EHeader: React.FC = () => {
  const { fileTree } = useSelector((state: AppState) => state.file);
  const { queue, projInfo } = useSelector((state: AppState) => state.proj);
  const [mainFile, setMainFile] = useState<TexFileModel>();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    if (!mainFile) {
      return;
    }
    let interval: NodeJS.Timeout | null = null;
    if (queue && Object.keys(queue).length > 0) {
      if (queue.comp_status !== 0 && interval) {
        clearInterval(interval);
        return;
      }
      let req: CompileProjLog = {
        project_id: mainFile.project_id,
        file_name: mainFile.name,
        version_no: queue.version_no,
        qid: queue.id,
        access_token: getAccessToken(),
      };
      if (queue.comp_status === CompileStatus.WAITING) {
        if (interval === null) {
          interval = setInterval(() => {
            getCompQueueStatus(queue.id);
          }, 5000);
        }
      } else if (queue.comp_status === CompileStatus.COMPILING) {
        clearCompileCheck(interval);
        getStreamLog(req);
      } else if (queue.comp_status === CompileStatus.COMPLETE) {
        clearCompileCheck(interval);
        compileProjectLog(req);
      } else {
        clearCompileCheck(interval);
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
        clearCompLogText("====CLEAR====");
      }
    });
  };

  const handleSettings = (mainFile: TexFileModel) => {};

  const handleProjHist = (mainFile: TexFileModel) => {
    const hist: QueryHistory = {
      project_id: mainFile.project_id,
      pageSize: 10
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
            handleProjHist(mainFile);
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
