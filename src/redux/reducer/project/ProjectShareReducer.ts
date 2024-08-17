import { ProjCollarModel } from "@/model/proj/share/ProjCollarModel";
import { AppState } from "@/redux/types/AppState";
import { Action, Reducer } from "@reduxjs/toolkit";
import { AnyAction, CombinedState } from "redux";

const initState: AppState["projShare"] = {
  collar: {} as ProjCollarModel[],
};

const ProjectShareReducer:Reducer<CombinedState<any>, Action> = (state = initState, action: AnyAction) => {
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
