import { Cv } from "@/model/cv/Cv";
import { CvTpl } from "@/model/tpl/CvTpl";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["cv"] = {
    userCvList: [],
    summary: {} as Cv,
    currTpl: {} as CvTpl,
    currMainColor: {} as Cv,
    currTheme: {} as Cv,
    cvconfig: {} as Cv
};

const CvReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "USER_CV_LIST":
            return {
                ...state,
                userCvList: action.data
            };
        case "EDIT_CV_SUMMAY":
            return {
                ...state,
                summary: action.data
            };
        case "GET_CV_SUMMAY":
            return {
                ...state,
                summary: action.data
            };
        case "CLEAR_CV_SUMMAY":
            return {
                ...state,
                summary: {}
            };
        case "UPDATE_CV_ORDER":
            return {
                ...state,
                summary: action.data
            };
        case "DELETE_USER_CV":
            let legacyUserCvList: Cv[] = state.userCvList;
            let filtered = legacyUserCvList.filter(item=>item.id !== action.data);
            return {
                ...state,
                userCvList: filtered
            };
        case "SET_CURR_TPL":
            return {
                ...state,
                currTpl: action.data
            };
        case "SET_CURR_MAIN_COLOR":
            return {
                ...state,
                currMainColor: action.data
            };
        case "SET_CURR_MAIN_THEME":
            return {
                ...state,
                currTheme: action.data
            };
        case "SET_CURR_MAIN_CONFIG":
            return {
                ...state,
                cvconfig: action.data
            };
        default:
            break;
    }
    return state;
};

export default CvReducer;


