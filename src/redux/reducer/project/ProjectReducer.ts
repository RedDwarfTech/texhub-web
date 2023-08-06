import { AppState } from "@/redux/types/AppState";

const initState: AppState["proj"] = {
    projList: []
};

const ProjectReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_PROJ_LIST":
            return {
                ...state,
                projList: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectReducer;