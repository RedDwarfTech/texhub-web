import "@/scss/style.scss";
import styles from "./TexHeader.module.css";
import { useNavigate } from "react-router-dom";
import { UserService } from "rd-component";
import avatarImg from "@/assets/icon/avatar.png";
import { ControlOutlined, LogoutOutlined, PayCircleOutlined } from "@ant-design/icons";
import { readConfig } from "@/config/app/config-reader";
import { AuthHandler, ResponseHandler } from "rdjs-wheel";
import store from "@/redux/store/store";
import { useSelector } from "react-redux";
import React from "react";

const TexHeader: React.FC = () => {

    const { loginUser } = useSelector((state: any) => state.rdRootReducer.user);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.addEventListener("click", handleMenuClose);
        return () => {
            document.removeEventListener("click", handleMenuClose);
        };
    }, []);

    const handleMenuClose = (event: any) => {
        const menu = document.getElementById('user-menu');
        const dropdown = document.getElementById('dropdown');
        if (menu && dropdown) {
            const target = event.target;
            if (!menu.contains(target)) {
                dropdown.style.display = 'none';
            }
        }
    }

    React.useEffect(() => {
        if (loginUser && Object.keys(loginUser).length > 0) {
            AuthHandler.storeLoginAuthInfo(loginUser, readConfig("baseAuthUrl"), readConfig("accessTokenUrlPath"));
            loadCurrentUser();
        }
    }, [loginUser]);

    const avatarClick = () => {
        const dropdown = document.getElementById("dropdown");
        if (dropdown) {
            if (dropdown.style.display == "none" || dropdown.style.display == "") {
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        }
    }

    const showUserProfile = () => {
        //handleMenuClick('profile');
        menuClose();
    }

    const menuClose = () => {
        const dropdown = document.getElementById('dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    const renderLogin = () => {
        if (UserService.isLoggedIn()) {
            var avatarUrl = localStorage.getItem('avatarUrl');
            return (
                <a id="user-menu">
                    {avatarUrl ? <img className={styles.avatarImg} src={avatarUrl} onClick={avatarClick} /> : <img className={styles.avatarImg} src={avatarImg} onClick={avatarClick} ></img>}
                    <div id="dropdown" className={styles.dropdownContent}>
                        <div onClick={() => handleMenuClick()}><PayCircleOutlined /><span>订阅</span></div>
                        <div onClick={showUserProfile}><ControlOutlined /><span>控制台</span></div>
                        <div onClick={() => UserService.doLoginOut(readConfig("logoutUrl"))}><LogoutOutlined /><span>登出</span></div>
                    </div>
                </a>
            );
        }
        const accessTokenOrigin = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
        if (accessTokenOrigin) {
            AuthHandler.storeCookieAuthInfo(accessTokenOrigin, readConfig("baseAuthUrl"), readConfig("accessTokenUrlPath"));
            loadCurrentUser();
        }
        return (
            <div className={styles.loginReg}>
                <div>
                    <button className="btn btn-outline-info text-light" onClick={() => { navigate('/user/login') }}>登录</button>
                </div>
                <div>
                    <button className="btn btn-outline-info text-light" onClick={() => { navigate('/user/reg') }}>注册</button>
                </div>
            </div>
        );
    }

    const loadCurrentUser = () => {
        if (!localStorage.getItem("userInfo")) {
            UserService.getCurrUser(readConfig("refreshUserUrl")).then((data: any) => {
                if (ResponseHandler.responseSuccess(data)) {
                    localStorage.setItem("userInfo", JSON.stringify(data.result));
                }
            });
        }
    }

    const handleMenuClick = () => {
        window.open("/goods");
        menuClose();
    };

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
                {renderLogin()}
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
