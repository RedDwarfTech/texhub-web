import { AppState } from "@/redux/types/AppState";

const initState: AppState["file"] = {
    fileList: [],
    fileTree: []
};

const FileReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_FILE_LIST":
            return {
                ...state,
                fileList: action.data
            };
        case "GET_FILE_TREE":
            return {
                ...state,
                fileTree: action.data
            };
        default:
            break;
    }
    return state;
};

export default FileReducer;