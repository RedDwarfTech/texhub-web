import "@/scss/style.scss";
import styles from "./TexHeader.module.css";
import { useNavigate } from "react-router-dom";

const TexHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.headerLayout}>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">TeXHub</a>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/">主页</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">模版中心</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/doc/tab">个人中心</a>
                            </li>
                            <li>
                                <button className="btn btn-outline-success" type="submit">登录</button>
                            </li>
                            <li>
                                <button className="btn btn-outline-success" type="submit">注册</button>
                            </li>
                            <li>
                                <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                        语言
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                        <li><a className="dropdown-item" href="#">简体中文</a></li>
                                        <li><a className="dropdown-item" href="#">English</a></li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default TexHeader;
