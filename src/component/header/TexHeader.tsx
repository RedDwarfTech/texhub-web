import "@/scss/style.scss";
import styles from "./TexHeader.module.css";
import { useNavigate } from "react-router-dom";

const TexHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.headerLayout}>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand text-light" href="/">TeXHub</a>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active text-light" aria-current="page" href="/">主页</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="/tpl">模版中心</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="/doc/tab">个人中心</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className={styles.headerOperation}>
                <div>
                    <button className="btn btn-outline-info text-light" onClick={() =>{navigate('/user/login')}}>登录</button>
                </div>
                <div>
                    <button className="btn btn-outline-info text-light" onClick={() =>{navigate('/user/reg')}}>注册</button>
                </div>
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
        </div>
    );
}

export default TexHeader;
