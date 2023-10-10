import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { UserService } from "rd-component";
import { ResponseHandler } from "rdjs-wheel";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const PwdReset: React.FC = () => {

    const [oldPwd, setOldPwd] = useState<string>();
    const [newPwd, setNewPwd] = useState<string>();
    const [repeatNewPwd, setRepeatNewPwd] = useState<string>();

    const handleOldPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setOldPwd(inputValue);
    }

    const handleNewPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setNewPwd(inputValue);
    }

    const handleRepeatNewPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        setRepeatNewPwd(inputValue);
    }

    const handlePwdReset = () => {
        if (!oldPwd) {
            toast.warn("请输入旧密码");
            return;
        }
        if (!newPwd) {
            toast.warn("请输入新密码");
            return;
        }
        if (!repeatNewPwd) {
            toast.warn("请输入重复的新密码");
            return;
        }
        if(repeatNewPwd !== newPwd) {
            toast.warn("新密码不匹配");
            return;
        }
        if(oldPwd === newPwd){
            toast.warn("新旧密码不能相同");
            return;
        }
        let params = {
            oldPassword:oldPwd,
            newPassword:newPwd
        };
        UserService.doResetPwd(params, "/texpub/user/change/pwd", store).then((resp)=>{
            if(ResponseHandler.responseSuccess(resp)) {
                toast.success("密码修改成功");
                UserService.doLoginOut(readConfig("logoutUrl"));
            }
        });
    }

    return (
        <div>
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <h6 className="card-title">重置密码</h6>
                </div>
                <div className="card-body col">
                    <div className="col mb-3">
                        <div className="mb-1"><span className="user-info">旧密码:</span></div>
                        <div>
                            <input className="form-control"
                                onChange={handleOldPwdChange}
                                type="password"
                                placeholder="输入旧密码"></input>
                        </div>
                    </div>
                    <div className="col mb-3">
                        <div className="mb-1"><span className="user-info">新密码:</span></div>
                        <div >
                            <input className="form-control"
                                onChange={handleNewPwdChange}
                                type="password"
                                placeholder="输入新密码"></input>
                        </div>
                    </div>
                    <div className="col mb-4">
                        <div className="mb-1"><span className="user-info">重复新密码:</span></div>
                        <div >
                            <input className="form-control"
                                onChange={handleRepeatNewPwdChange}
                                type="password"
                                placeholder="再次输入新密码"></input>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={handlePwdReset}>重置密码</button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default PwdReset;
