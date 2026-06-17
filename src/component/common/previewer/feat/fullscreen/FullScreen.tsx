import React from "react";
import Previewer from "@/component/common/previewer/main/Previewer";
import styles from "./FullScreen.module.css";
import { useTranslation } from "react-i18next";

const FullScreen: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const projId = params.get("projId");
  const curPage = params.get("curPage");
  const { t } = useTranslation();

  React.useEffect(() => {
    return () => {};
  }, []);

  if (!projId) {
    return <div>{t("tips_loading")}</div>;
  }

  return (
    <div className={styles.fscontainer}>
      <Previewer
        projectId={projId}
        viewModel={"fullscreen"}
        curPage={Number(curPage)}
      ></Previewer>
    </div>
  );
};

export default FullScreen;
