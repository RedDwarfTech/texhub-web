import './TeXHubFooter.module.css';
import React from "react";
import policeLogo from "@/assets/footer/gwab.webp";
import { useTranslation } from "react-i18next";

const TeXHubFooter: React.FC = () => {

  let yearNow = new Date().toISOString().substr(0,4);
  const { t } = useTranslation();

  return (
    <div className="App-footer-float">
      <div id="footer" className="App-footer">
        <div className="App-footer-divider"></div>
        <div className="custom-row">
          <div className="App-footer-div">&copy;2021-{yearNow} RedDwarf 重庆红矮星科技有限公司 <a href="http://beian.miit.gov.cn/">渝ICP备2021003460号-1</a> <a href="mailto:jiangxiaoqiang@poemhub.top">{t("contact_us")}</a></div>
        </div>
        <div className="custom-row">
          <div className="App-footer-div"><img src={policeLogo}></img><a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50022502000614"> 渝公网安备 50022502000614 号</a></div>
        </div>
      </div>
    </div>
  );
}

export default TeXHubFooter;