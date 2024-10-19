import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import proj from "@/redux/reducer/project/ProjectReducer";
import tpl from "@/redux/reducer/tpl/TemplateReducer";
import file from "@/redux/reducer/file/FileReducer";
import snippet from "@/redux/reducer/snippet/SnippetReducer";
import projShare from "@/redux/reducer/project/ProjectShareReducer";
import projEditor from "@/redux/reducer/project/EditorReducer";
import preview from "@/redux/reducer/project/preview/PreviewReducer";
import projTree from "@/redux/reducer/project/tree/ProjectTreeReducer";

const rootReducer = combineReducers({
    proj,
    rdRootReducer,
    tpl,
    file,
    snippet,
    projShare,
    projEditor,
    preview,
    projTree
});

export default rootReducer;
