import { AppState } from "@/redux/types/AppState";

const initState: AppState["snippet"] = {
    snippets: []
};

const PwdReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SEND_VERIFY_CODE":
            return {
                ...state,
                snippets: action.data
            };
        case "VERIFY":
            return {
                ...state,
                fileTree: action.data
            };
        default:
            break;
    }
    return state;
};

export default PwdReducer;