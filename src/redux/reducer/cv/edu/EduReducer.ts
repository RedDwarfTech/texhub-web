import { EduModel } from "@/model/cv/edu/EduModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["edu"] = {
    savedEdu: {},
    eduList: []
};

const EduReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_EDU":
            return {
                ...state,
                savedEdu: action.data
            };
        case "CLEAR_CURRENT_EDU":
            return {
                ...state,
                savedEdu: action.data
            };
        case "GET_EDU_LIST":
            return {
                ...state,
                eduList: action.data
            };
        case "DEL_EDU_ITEM":
            const newEduList: EduModel[] = state.eduList as EduModel[];
            let delId:number = action.data;
            return {
                ...state,
                eduList: newEduList.filter(e => e.id !== delId)
            };
        default:
            break;
    }
    return state;
};

export default EduReducer;


