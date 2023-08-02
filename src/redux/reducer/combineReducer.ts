import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import doc from "@/redux/reducer/doc/DocReducer";

const rootReducer = combineReducers({
    doc,
    rdRootReducer
});

export default rootReducer;
