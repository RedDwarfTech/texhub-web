import { ProjConfType } from "@/model/proj/config/ProjConfType";
import styles from "./ProjSetting.module.css";
import { changeProjConf } from "@/service/project/ProjectService";
import { ProjConf } from "@/model/proj/config/ProjConf";

const ProjSetting: React.FC = () => {
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
                <h6 className="offcanvas-title" id="offcanvasExampleLabel">项目设置</h6>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className={styles.configItem}>
                    <div className={styles.configItemKey}>LaTeX编译器:</div>
                    <div>
                        <select className="form-select" defaultValue="XeLaTeX" aria-label="Default select example">
                            <option>XeLaTeX</option>
                        </select>
                    </div>
                </div>
                <div className={styles.configItem}>
                    <div className={styles.configItemKey}>编辑器主题:</div>
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