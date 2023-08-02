import { CvGenModel } from "@/model/cv/gen/CvGenModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["gen"] = {
    cvGenPage: {},
    cvGenList: [],
    genUpdateList: [],
};

const CvGenReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "CV_GEN_PAGE":
            return {
                ...state,
                cvGenPage: action.data
            };
        case "CV_GEN_LIST":
            return {
                ...state,
                cvGenList: action.data
            };
        case "DEL_CV_GEN":
            const newCvGenList: CvGenModel[] = state.cvGenList as CvGenModel[];
            let delId: number = action.data;
            return {
                ...state,
                cvGenList: newCvGenList.filter(e => e.id !== delId)
            };
        case "CHECK_GEN_STATUS":
            let updateList = action.data as CvGenModel[];
            return {
                ...state,
                genUpdateList: updateList
            };
        default:
            break;
    }
    return state;
};

export default CvGenReducer;


