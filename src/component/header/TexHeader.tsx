import "@/scss/style.scss";
import styles from "./TexHeader.module.css";

const TexHeader: React.FC = () => {
    return (
        <div className={styles.headerLayout}>
            <div className="btn btn-primary">登录</div>
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    语言
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a className="dropdown-item" href="#">简体中文</a></li>
                    <li><a className="dropdown-item" href="#">English</a></li>
                </ul>
            </div>
        </div>
    );
}

export default TexHeader;
