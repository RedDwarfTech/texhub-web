import { AppState } from "@/redux/types/AppState";

const initState: AppState["snippet"] = {
    snippets: []
};

const SnippetReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_SNIPPET_LIST":
            return {
                ...state,
                snippets: action.data
            };
        default:
            break;
    }
    return state;
};

export default SnippetReducer;