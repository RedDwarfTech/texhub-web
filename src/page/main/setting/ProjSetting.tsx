import styles from "./ProjSetting.module.css";

const ProjSetting: React.FC = () => {

    return (
        <div className="offcanvas offcanvas-start" tab-index="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h6 className="offcanvas-title" id="offcanvasExampleLabel">项目设置</h6>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className={styles.configItem}>
                    <div>LaTeX编译器:</div>
                    <div>
                        <select className="form-select" defaultValue="XeLaTeX" aria-label="Default select example">
                            <option>XeLaTeX</option>
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