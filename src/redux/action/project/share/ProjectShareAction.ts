
export type projectShareAction = getCollarUserAction ;

export enum ProjectShareActionType {
    GET_COLLAR_USERS
}

export interface getCollarUserAction {
    type: ProjectShareActionType.GET_COLLAR_USERS;
    data: any;
}
