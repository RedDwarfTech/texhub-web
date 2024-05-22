import { AppState } from "@/redux/types/AppState";

const initState: AppState["projShare"] = {
    collar: [],
};

const ProjectShareReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "GET_COLLAR_USERS":
            return {
                ...state,
                collar: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectShareReducer;