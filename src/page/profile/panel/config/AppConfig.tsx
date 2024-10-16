import { saveGithubToken } from "@/service/profile/AppConfigService";
import { ResponseHandler } from "rdjs-wheel";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";

const AppConfig: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>();
  const { t } = useTranslation();

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
      <ToastContainer />
    </div>
  );
};

export default AppConfig;
