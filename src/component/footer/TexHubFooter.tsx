import './TeXHubFooter.module.css';
import React from "react";
import policeLogo from "@/assets/footer/gwab.webp";
import { useTranslation } from "react-i18next";

const TeXHubFooter: React.FC = () => {

  let yearNow = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <div className="App-footer-float">
      <div id="footer" className="App-footer">
        <div className="App-footer-divider"></div>
        <div className="custom-row">
          <div className="App-footer-div">&copy;2021-{yearNow} RedDwarf {t("company_name")} <a href="http://beian.miit.gov.cn/">{t("icp_no")}</a> <a href="mailto:jiangxiaoqiang@poemhub.top">{t("contact_us")}</a></div>
        </div>
        <div className="custom-row">
          <div className="App-footer-div"><img alt='police logo' src={policeLogo}></img><a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50022502000614"> {t("network_no")}</a></div>
        </div>
      </div>
    </div>
  );
}

export default TeXHubFooter;