import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["file"] = {
    fileList: [],
    fileTree: [],
    file: {} as TexFileModel
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
        case "CHOOSE_FILE":
            return {
                ...state,
                file: action.data
            };
        default:
            break;
    }
    return state;
};

export default FileReducer;