import { isEnableSubDoc } from "@/common/EnvUtil.js";
import { saveGithubToken } from "@/service/profile/AppConfigService";
import { ResponseHandler } from "rdjs-wheel";
import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";

const AppConfig: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>();
  const [devModel, setDevModel] = useState<boolean>();
  const [legacyModel, setLegacyModel] = useState<string>();
  const { t } = useTranslation();

  React.useEffect(() => {
    let devModelFlag = localStorage.getItem("devModel");
    if (devModelFlag && Boolean(devModelFlag) === true) {
      setDevModel(true);
    } else {
      setDevModel(false);
    }

    let wsLegacyModelFlag = localStorage.getItem("legacyModel");
    setLegacyModel(wsLegacyModelFlag ? wsLegacyModelFlag.toString() : "native");
  }, []);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    setGithubToken(inputValue);
  };

  const handlePwdReset = () => {
    if (!githubToken) {
      toast.warn(t("tips_input_github_token"));
      return;
    }
    saveGithubToken(githubToken).then((resp) => {
      if (ResponseHandler.responseSuccess(resp)) {
        toast.success(t("tips_success"));
      } else {
        toast.warn(resp.msg);
      }
    });
  };

  const renderInput = () => {
    if (devModel) {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            let curModel: boolean = devModel ? false : true;
            setDevModel(curModel);
            localStorage.setItem("devModel", String(curModel));
          }}
          checked
        />
      );
    } else {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            let curModel: boolean = devModel ? false : true;
            setDevModel(curModel);
            localStorage.setItem("devModel", String(curModel));
          }}
        />
      );
    }
  };

  const renderChannelInput = () => {
    if (legacyModel === "native" || !legacyModel) {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            setLegacyModel("socketio");
            localStorage.setItem("legacyModel", "socketio");
          }}
        />
      );
    } else {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            setLegacyModel("native");
            localStorage.setItem("legacyModel", "native");
          }}
          checked
        />
      );
    }
  };

  const renderSubDocInput = () => {
    if (isEnableSubDoc()) {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            localStorage.setItem("subdoc", "normal");
          }}
          checked
        />
      );
    } else {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            localStorage.setItem("subdoc", "subdoc");
          }}
        />
      );
    }
  };

  const renderShortFileIdInput = () => {
    if (
      localStorage.getItem("shortFileId") &&
      localStorage.getItem("shortFileId")?.toString() === "short"
    ) {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            localStorage.setItem("shortFileId", "normal");
          }}
          checked
        />
      );
    } else {
      return (
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckChecked"
          onChange={() => {
            localStorage.setItem("shortFileId", "short");
          }}
        />
      );
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h6 className="card-title">Github</h6>
        </div>
        <div className="card-body col">
          <div className="col mb-3">
            <div className="mb-1">
              <span className="user-info">Github Token:</span>
            </div>
            <div>
              <input
                className="form-control"
                onChange={handleTokenChange}
                type="password"
                placeholder={t("tips_input_github_token")}
              ></input>
            </div>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handlePwdReset}>
              {t("btn_save")}
            </button>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <h6 className="card-title">{t("title_dev_model")}</h6>
        </div>
        <div className="card-body col">
          <div className="col mb-3">
            <div className="form-check form-switch">
              {renderInput()}
              <label className="form-check-label">{t("title_dev_model")}</label>
            </div>
          </div>
          <div className="col mb-3">
            <div className="form-check form-switch">
              {renderChannelInput()}
              <label className="form-check-label">
                {t("title_socket_channel")}
              </label>
            </div>
          </div>
          <div className="col mb-3">
            <div className="form-check form-switch">
              {renderSubDocInput()}
              <label className="form-check-label">subDocument</label>
            </div>
          </div>
          <div className="col mb-3">
            <div className="form-check form-switch">
              {renderShortFileIdInput()}
              <label className="form-check-label">Short File ID</label>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AppConfig;
