import { SkillModel } from "@/model/cv/skill/SkillModel";
import { AppState } from "@/redux/types/AppState";

const initState: AppState["skill"] = {
    savedSkill: {},
    skillList: []
};

const SkillReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "SAVE_SKILL":
            return {
                ...state,
                savedWork: action.data
            };
        case "GET_SKILL_LIST":
            return {
                ...state,
                skillList: action.data
            };
        case "CLEAR_CURRENT_SKILL":
            return {
                ...state,
                savedSkill: action.data
            };
        case "DEL_SKILL_ITEM":
            const newEduList: SkillModel[] = state.skillList as SkillModel[];
            let delId: number = action.data;
            return {
                ...state,
                skillList: newEduList.filter(e => e.id !== delId)
            };
        default:
            break;
    }
    return state;
};

export default SkillReducer;


