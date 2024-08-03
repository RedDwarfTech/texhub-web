import TexHeader from "@/component/header/TexHeader";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import onlineEditor from "@/assets/cv/template/tex-online-editor-compress.jpg";
import userProjects from "@/assets/cv/template/user-projects.jpg";
import onlineCollarboration from "@/assets/cv/template/online-collaboration.jpg";
import { UserService } from "rd-component";
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from "react-i18next";
import TeXHubFooter from "@/component/footer/TexHubFooter";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleUseReq = () => {
        if(!UserService.isLoggedIn()){
            toast.warning("登录后即可体验");
            return;
        }
        navigate('/doc/tab');
    }

    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.container}>
                <div className={styles.overview}>
                    <div className={styles.overviewContent}>
                        <h1>{t("online_latex")}</h1>
                        <h4>{t("online_latex_slogan")}</h4>
                        <button className="btn btn-primary" onClick={() => { handleUseReq() }}>{t("btn_explore")}</button>
                    </div>
                </div>
                <div className={styles.template}>
                    <div className={styles.opRight}>
                        <h1>{t("anywhere")}</h1>
                        <h4>{t("anywhere_slogan")}</h4>
                        <h4>{t("anywhere_slogan_1")}</h4>
                    </div>
                    <div className={styles.tplRight}>
                        <img src={onlineEditor} alt="tpl" />
                    </div>
                </div>
                <div className={styles.templateDark}>
                    <div className={styles.tplRight}>
                        <img src={userProjects} alt="proj" />
                    </div>
                    <div className={styles.opRight}>
                        <h1>{t("morethanpaper")}</h1>
                        <h4>{t("morethanpaper_slogan")}</h4>
                        <h4>{t("morethanpaper_slogan_1")}</h4>
                    </div>
                </div>
                <div className={styles.template}>
                    <div className={styles.opRight}>
                        <h1>{t("online_collar")}</h1>
                        <h4>{t("online_collar_parallel")}</h4>
                    </div>
                    <div className={styles.tplRight}>
                        <img src={onlineCollarboration} alt="onlinecollar" />
                    </div>
                </div>
                <div className={styles.buttonDiv}>

                </div>
            </div>
            <TeXHubFooter></TeXHubFooter>
            <ToastContainer />
        </div>
    );
}
export default Home;