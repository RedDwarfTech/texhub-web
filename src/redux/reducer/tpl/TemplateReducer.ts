import { TemplateModel } from "@/model/tpl/TemplateModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["tpl"] = {
    tplList: [],
    tplDetail: {} as TemplateModel
};

const TemplateReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_TPL_DETAIL":
            return {
                ...state,
                tplDetail: action.data
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