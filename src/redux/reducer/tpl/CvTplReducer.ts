import { CvTpl } from "@/model/tpl/CvTpl";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["tpl"] = {
    tplList: [],
    tpl: {} as CvTpl
};

const CvTplReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_TPL_LIST":
            return {
                ...state,
                tplList: action.data
            };
        case "GET_TPL":
            return {
                ...state,
                tpl: action.data
            };
        default:
            break;
    }
    return state;
};

export default CvTplReducer;


