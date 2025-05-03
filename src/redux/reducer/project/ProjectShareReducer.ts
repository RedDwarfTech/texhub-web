import { ProjCollarModel } from "@/model/proj/share/ProjCollarModel";
import { AppState } from "@/redux/types/AppState";
import { Action, Reducer } from "@reduxjs/toolkit";
import { UnknownAction } from "redux";

const initState: AppState["projShare"] = {
  collar: {} as ProjCollarModel[],
};

const ProjectShareReducer:Reducer<any, Action> = (state = initState, action: UnknownAction) => {
  switch (action.type) {
    case "GET_COLLAR_USERS":
      return {
        ...state,
        collar: action.data,
      };
    default:
      break;
  }
  return state;
};

export default ProjectShareReducer;
