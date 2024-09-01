import { TexFileModel } from "@/model/file/TexFileModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["file"] = {
    fileList: [],
    fileTree: [],
    folderTree: {} as TexFileModel,
    activeFile: {} as TexFileModel,
    treeSelectItem: {} as TexFileModel,
    mainFile: {} as TexFileModel,
    curFileTree: [] as TexFileModel[]
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
        case "GET_FOLDER_TREE":
            return {
                ...state,
                folderTree: action.data
            };
        case "CHOOSE_FILE":
            return {
                ...state,
                treeSelectItem: action.data
            };   
        case "SWITCH_EDITOR_FILE":
            return {
                ...state,
                activeFile: action.data
            };
        case "GET_MAIN_FILE":
            return {
                ...state,
                mainFile: action.data
            };
        case "UPDATE_FILE_INITIAL":
            return {
                ...state,
                mainFile: action.data
            };
        case "SET_CUR_FILE_TREE":
            return {
                ...state,
                curFileTree: action.data
            };
        default:
            break;
    }
    return state;
};

export default FileReducer;