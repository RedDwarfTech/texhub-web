import { AppState } from "@/redux/types/AppState";

const initState: AppState["tpl"] = {
    tplList: []
};

const TemplateReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_EDU":
            return {
                ...state,
                savedEdu: action.data
            };
        case "GET_TPL_LIST":
            return {
                ...state,
                tplList: action.data
            };
        default:
            break;
    }
    return state;
};

export default TemplateReducer;