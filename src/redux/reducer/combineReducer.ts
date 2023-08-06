import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import proj from "@/redux/reducer/project/ProjectReducer";
import tpl from "@/redux/reducer/tpl/TemplateReducer";
import file from "@/redux/reducer/file/FileReducer";

const rootReducer = combineReducers({
    proj,
    rdRootReducer,
    tpl,
    file
});

export default rootReducer;
