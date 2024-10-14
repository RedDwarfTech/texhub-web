export type projectAction = saveGithubTokenAction;

export enum AppConfigActionType {
    SAVE_GITHUB_TOKEN
}

export interface saveGithubTokenAction {
    type: AppConfigActionType.SAVE_GITHUB_TOKEN;
    data: any;
}