import TexHeader from "@/component/header/TexHeader";
import styles from './Settings.module.css';
import { useState } from "react";
import { ResponseHandler, UserModel } from "rdjs-wheel";
import { useSelector } from "react-redux";
import { UserProfile, UserService } from "rd-component";
import { toast } from "react-toastify";
import * as bootstrap from 'bootstrap';
import store from "@/redux/store/store";
import React from "react";
import PwdReset from "./pwd/PwdReset";
import MyOrder from "./order/MyOrder";
import { readConfig } from "@/config/app/config-reader";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {

    const [currentPanel, setCurrentPanel] = useState('userinfo');
    const [userInfo, setUserInfo] = useState<UserModel>();
    const [curNickname, setCurNickname] = useState('');
    const { user } = useSelector((state: any) => state.rdRootReducer.user);
    const { t } = useTranslation();

    React.useEffect(() => {
        getUserInfo();
    }, []);

    React.useEffect(() => {
        if (user && Object.keys(user).length > 0) {
            setUserInfo(user);
        }
    }, [user]);

    const getUserInfo = () => {
        const userInfoJson = localStorage.getItem("userInfo");
        if (userInfoJson) {
            const uInfo: UserModel = JSON.parse(userInfoJson);
            setUserInfo(uInfo);
        } else {
            UserService.loadCurrUser(false, "/infra/user/current-user");
        }
    }

    const handlePanelSwitch = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        const targetData = e.target.getAttribute('data-target') || e.target.parentNode.getAttribute('data-target');;
        if (targetData) {
            setCurrentPanel(targetData);
        }
    }

    const handleInputChange = (event: any) => {
        setCurNickname(event.target.value);
    };

    const handleNicknameConfirm = () => {
        if (!curNickname || curNickname.length === 0) {
            toast.warn("请输入文件夹名称");
            return;
        }
        let newNick = {
            nickname: curNickname
        };
        UserService.doSetNickname(newNick, "/infra/user/nickname", store).then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                UserService.loadCurrUser(true, readConfig("refreshUserUrl")).then((res)=>{
                    const userInfoJson = localStorage.getItem("userInfo");
                    if (userInfoJson) {
                        const uInfo: UserModel = JSON.parse(userInfoJson);
                        setUserInfo(uInfo);
                    }
                });
            }
        });
    }

    const handleNicknameEdit = () => {
        let modal = document.getElementById('renameModal');
        if (modal) {
            var nicknameEditModal = new bootstrap.Modal(modal);
            nicknameEditModal.show();
        }
    }

    const renderPanelContent = () => {
        if (currentPanel && currentPanel === 'experience') {
            return <div></div>
        }
        if (currentPanel && currentPanel === 'feedback') {
            return <div></div>
        }
        if (currentPanel && currentPanel === 'resetpwd') {
            return <PwdReset></PwdReset>
        }
        if (currentPanel && currentPanel === 'order') {
            return <MyOrder></MyOrder>
        }
        if (currentPanel && currentPanel === 'userinfo') {
            return (
                <div id="userinfo">
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="card-header">
                            <h6 className="card-title">{t("profile")}</h6>
                        </div>
                        <div className="card-body row">
                            <div className="col">
                                <div><span className="user-info">{t("nickname")}:</span></div>
                                <div ><span className="user-info">{userInfo ? userInfo!.nickname : ""}</span></div>
                                <div ><button onClick={() => { handleNicknameEdit() }} className="btn btn-primary">设置昵称</button></div>
                            </div>
                            <div className="col">
                                <div ><span className="user-info">会员到期日:</span></div>
                                <div ><span className="user-info">{userInfo ? UserProfile.getVipExpiredTime(userInfo) : "--"}</span></div>
                                <div ></div>
                            </div>
                        </div>
                    </div>
                    {/**
                     * <div className="card">
                        <div className="card-header">
                            <h6 className="card-title">危险操作</h6>
                        </div>
                        <div className="card-body">
                            <div className="dangerZoneRow">
                                <div>
                                    <span>从系统删除当前用户，此操作不可恢复。</span>
                                </div>
                                <div>
                                    <button className="btn btn-danger" onClick={() => { }}>注销用户</button>
                                </div>
                            </div>
                        </div>
                    </div>
                     */}
                    <div className="modal fade" id="renameModal" aria-labelledby="renameModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="renameModalLabel">重命名</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="input-group flex-nowrap">
                                        <input id="folderName"
                                            type="text"
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="新名称"
                                            aria-label="Username"
                                            aria-describedby="addon-wrapping" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { handleNicknameConfirm() }}>确定</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>);
        }
        return (<div></div>);
    }

    return (<div>
        <TexHeader></TexHeader>
        <div className={styles.panelContainer}>
            <div className={styles.panelMenu}>
                <div className={styles.menuItem} data-target="userinfo" id="userinfo-menu" onClick={handlePanelSwitch}>
                    <span>{t("profile")}</span>
                </div>
                <div className={styles.menuItem} data-target="resetpwd" id="userinfo-menu" onClick={handlePanelSwitch}>
                    <span>{t("resetPwd")}</span>
                </div>
                <div className={styles.menuItem} data-target="order" id="userinfo-menu" onClick={handlePanelSwitch}>
                    <span>{t("myOrder")}</span>
                </div>
                {/**
                * <div className={styles.menuItem} data-target="feedback" id="feedback-menu" onClick={handlePanelSwitch}>
                    <span>意见与建议</span>
                </div>
                */}
            </div>
            <div className={styles.panelContent}>
                {renderPanelContent()}
            </div>
        </div>
    </div>
    );
}

export default Settings;