export interface EmailLoginReq {
    email: string;
    password?: string;
    verifyCode?: string;
    appId: string;
    deviceId: string;
    cfToken: string;
}
