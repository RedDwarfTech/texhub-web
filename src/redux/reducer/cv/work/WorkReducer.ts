import { WorkModel } from "@/model/cv/work/WorkModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["work"] = {
    savedWork: {},
    workList: [],
    workDuty: ''
};

const WorkReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_WORK":
            return {
                ...state,
                savedWork: action.data
            };
        case "GET_WORK_LIST":
            return {
                ...state,
                workList: action.data
            };
        case "CLEAR_CURRENT_WORK":
            return {
                ...state,
                savedWork: action.data
            };
        case "DEL_WORK_ITEM":
            const newEduList: WorkModel[] = state.workList as WorkModel[];
            let delId: number = action.data;
            return {
                ...state,
                workList: newEduList.filter(e => e.id !== delId)
            };
        case "GET_WORK_EXP_DUTY":
            return {
                ...state,
                workDuty: action.data
            };
        default:
            break;
    }
    return state;
};

export default WorkReducer;


