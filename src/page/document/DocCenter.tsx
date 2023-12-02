import TexHeader from "@/component/header/TexHeader";
import styles from "./DocCenter.module.css";


const DocCenter: React.FC = () => {
    return (
        <div>
            <TexHeader></TexHeader>
            <div className={styles.docBody}>
                <div className={styles.docContainer}>
                    <div className={styles.docItem}>
                        <h6>欢迎来到TeXHub文档中心</h6>
                    </div>
                    <div className={styles.docItem}>
                        <a target="_blank" href="https://texdoc.org/serve/lshort-zh-cn.pdf/0">一份不太简短的LaTeX介绍</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocCenter;