import { TemplateModel } from "@/model/tpl/TemplateModel";
import { AppState } from "@/redux/types/AppState";
import { EntityList, ResponseHandler } from "rdjs-wheel";

const initState: AppState["tpl"] = {
    tplList: [],
    tplDetail: {} as TemplateModel,
    tplPage: {} as EntityList<TemplateModel>,
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
        case "GET_TPL_PAGE":
            return {
                ...state,
                tplPage: action.data
            };
        default:
            break;
    }
    return state;
};

export default TemplateReducer;