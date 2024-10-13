export type projectAction = projSearchAction;

export enum ProjectTreeActionType {
    PROJ_SEARCH
}

export interface projSearchAction {
    type: ProjectTreeActionType.PROJ_SEARCH;
    data: any;
}