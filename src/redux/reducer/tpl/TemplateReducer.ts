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
            let resp: EntityList<TemplateModel> = ResponseHandler.mapUnwrapPage(action.data);
            return {
                ...state,
                tplPage: resp
            };
        default:
            break;
    }
    return state;
};

export default TemplateReducer;