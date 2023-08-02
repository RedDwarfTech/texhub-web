import { AppState } from "@/redux/types/AppState";

const initState: AppState["doc"] = {
    docList: []
};

const DocReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_EDU":
            return {
                ...state,
                savedEdu: action.data
            };
        case "GET_DOC_LIST":
            return {
                ...state,
                docList: action.data
            };
        default:
            break;
    }
    return state;
};

export default DocReducer;