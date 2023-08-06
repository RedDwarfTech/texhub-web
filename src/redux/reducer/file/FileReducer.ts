import { AppState } from "@/redux/types/AppState";

const initState: AppState["file"] = {
    fileList: []
};

const FileReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_FILE_LIST":
            return {
                ...state,
                fileList: action.data
            };
        default:
            break;
    }
    return state;
};

export default FileReducer;