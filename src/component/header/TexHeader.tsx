import "@/scss/style.scss";
import styles from "./TexHeader.module.css";
import { useNavigate } from "react-router-dom";
import { UserService } from "rd-component";
import avatarImg from "@/assets/icon/avatar.png";
import { readConfig } from "@/config/app/config-reader";
import { AuthHandler, ResponseHandler } from "rdjs-wheel";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const TexHeader: React.FC = () => {

    const { loginUser } = useSelector((state: any) => state.rdRootReducer.user);
    const [isLoggedIn, setIsLoggedIn] = useState(UserService.isLoggedIn() || false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { i18n } = useTranslation();

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
            if (dropdown.style.display === "none" || dropdown.style.display === "") {
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        }
    }

    const showUserProfile = () => {
        navigate("/user/panel");
        menuClose();
    }

    const menuClose = () => {
        const dropdown = document.getElementById('dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    const renderLogin = () => {
        if (isLoggedIn) {
            var avatarUrl = localStorage.getItem('avatarUrl');
            return (
                <a id="user-menu">
                    {avatarUrl ? <img alt="avatar" className={styles.avatarImg} src={avatarUrl} onClick={avatarClick} /> : <img className={styles.avatarImg} alt="avatar" src={avatarImg} onClick={avatarClick} ></img>}
                    <div id="dropdown" className={styles.dropdownContent}>
                        <div onClick={() => handleMenuClick()}>
                            <i className="fa-solid fa-wallet"></i>
                            <span>t("price")</span>
                        </div>
                        <div onClick={showUserProfile}>
                            <i className="fa-solid fa-gear"></i>
                            <span>t("console")</span></div>
                        <div onClick={() => UserService.doLoginOut(readConfig("logoutUrl"))}>
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>t("logout")</span>
                        </div>
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
                    <button className="btn btn-outline-info text-light" onClick={() => { navigate('/user/login') }}>t("login")</button>
                </div>
                <div>
                    <button className="btn btn-outline-info text-light" onClick={() => { navigate('/user/reg') }}>t("signup")</button>
                </div>
            </div>
        );
    }

    const loadCurrentUser = () => {
        if (localStorage.getItem("userInfo")) {
            return;
        }
        UserService.getCurrUser(readConfig("refreshUserUrl")).then((data: any) => {
            if (ResponseHandler.responseSuccess(data)) {
                localStorage.setItem("userInfo", JSON.stringify(data.result));
                setIsLoggedIn(true);
            }
        });
    }

    const handleMenuClick = () => {
        window.open("/goods");
        menuClose();
    };

    const langChoose = (name: string) => {
        i18n.changeLanguage(name);
        localStorage.setItem("userLanguage", name);
    }

    const renderUserTab = () => {
        if (UserService.isLoggedIn()) {
            return (<li className="nav-item">
                <a className="nav-link text-light" href="/doc/tab">{t("projects")}</a>
            </li>);
        }
    }

    return (
        <div className={styles.headerLayout}>
            <nav className="navbar navbar-expand-sm navbar-dark">
                <div className="container-fluid">
                    <a className="navbar-brand text-light" href="/">TeXHub(Beta)</a>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active text-light" aria-current="page" href="/">{t("home")}</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="/tpl">{t("template")}</a>
                            </li>
                            {renderUserTab()}
                            <li className="nav-item">
                                <a className="nav-link text-light" href="/doc/help">{t("document")}</a>
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
                        <li onClick={() => langChoose("zh")}>
                            <a className="dropdown-item" href="#">简体中文</a>
                        </li>
                        <li onClick={() => langChoose("en")}>
                            <a className="dropdown-item" href="#">English</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TexHeader;
