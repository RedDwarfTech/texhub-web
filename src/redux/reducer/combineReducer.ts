import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import doc from "@/redux/reducer/doc/DocReducer";
import tpl from "@/redux/reducer/tpl/TemplateReducer";

const rootReducer = combineReducers({
    doc,
    rdRootReducer,
    tpl
});

export default rootReducer;
