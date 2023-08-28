import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["file"] = {
    fileList: [],
    fileTree: [],
    file: {} as TexFileModel,
    mainFile: {} as TexFileModel,
    fileCode: ''
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
        case "GET_MAIN_FILE":
            return {
                ...state,
                mainFile: action.data
            };
        case "GET_FILE_CODE":
            return {
                ...state,
                fileCode: action.data
            };
        case "UPDATE_FILE_INITIAL":
            return {
                ...state,
                mainFile: action.data
            };
        default:
            break;
    }
    return state;
};

export default FileReducer;