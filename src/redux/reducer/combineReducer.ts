import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import doc from "@/redux/reducer/doc/DocReducer";
import tpl from "@/redux/reducer/tpl/TemplateReducer";
import file from "@/redux/reducer/file/FileReducer";

const rootReducer = combineReducers({
    doc,
    rdRootReducer,
    tpl,
    file
});

export default rootReducer;
