import { LangModel } from "@/model/cv/lang/LangModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["lang"] = {
    savedLang: {},
    langList: []
};

const LangReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_LANG":
            return {
                ...state,
                savedLang: action.data
            };
        case "GET_LANG_LIST":
            return {
                ...state,
                langList: action.data
            };
        case "CLEAR_CURRENT_LANG":
            return {
                ...state,
                savedLang: action.data
            };
        case "DEL_LANG_ITEM":
            const newEduList: LangModel[] = state.langList as LangModel[];
            let delId: number = action.data;
            return {
                ...state,
                langList: newEduList.filter(e => e.id !== delId)
            };
        default:
            break;
    }
    return state;
};

export default LangReducer;


