import { ProjConfType } from "@/model/proj/config/ProjConfType";
import styles from "./ProjSetting.module.css";
import { changeProjConf } from "@/service/project/ProjectService";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { useTranslation } from "react-i18next";

const ProjSetting: React.FC = () => {

    const { t } = useTranslation();
    
    const handleConfChange = (confType: ProjConfType, value: string) => {
        let projConf: ProjConf = {
            confYype: confType,
            confValue: value
        };
        changeProjConf(projConf);
    }

    return (
        <div className="offcanvas offcanvas-start" tab-index="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h6 className="offcanvas-title" id="offcanvasExampleLabel">{t("btn_settings")}</h6>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className={styles.configItem}>
                    <div className={styles.configItemKey}>{t("label_latex_compiler")}:</div>
                    <div>
                        <select className="form-select" defaultValue="XeLaTeX" aria-label="Default select example">
                            <option>XeLaTeX</option>
                        </select>
                    </div>
                </div>
                <div className={styles.configItem}>
                    <div className={styles.configItemKey}>{t("label_editor_theme")}:</div>
                    <div>
                        <select className="form-select"
                            defaultValue="Solarized Light"
                            onChange={(e) => {
                                handleConfChange(ProjConfType.Theme, e.target.value);
                            }}
                            aria-label="Default select example">
                            <option>Solarized Light</option>
                            <option>Basic Light</option>
                        </select>
                    </div>
                </div>
                <div className="dropdown mt-3">
                </div>
            </div>
        </div>
    );
}

export default ProjSetting;