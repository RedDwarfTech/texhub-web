export type projectAction = sendCodeAction | verifyAction;

export enum PwdActionType {
    SEND_VERIFY_CODE,
    VERIFY,
}

export interface sendCodeAction {
    type: PwdActionType.SEND_VERIFY_CODE;
    data: any;
}

export interface verifyAction {
    type: PwdActionType.VERIFY;
    data: any;
}