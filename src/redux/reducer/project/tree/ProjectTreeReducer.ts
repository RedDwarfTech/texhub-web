import { CompileResult } from "@/model/proj/CompileResult";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { AppState } from "@/redux/types/AppState";
import { JoinResult } from "@/model/proj/JoinResult";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { SearchResult } from "@/model/proj/search/SearchResult";

const initState: AppState["projTree"] = {
    hits: [] as SearchResult[],
};

const ProjectTreeReducer = (state = initState, action: any) => {
    switch (action.type) {
        case "PROJ_SEARCH":
            return {
                ...state,
                hits: action.data
            };
        default:
            break;
    }
    return state;
};

export default ProjectTreeReducer;