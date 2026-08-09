export interface EmailRegReq {
    email: string;
    phone?: string;
    password: string;
    verifyCode: string;
    appId: string;
    deviceId: string;
}
