import { CompileResult } from "@/model/prj/CompileResult";
import { LatestCompile } from "@/model/prj/LatestCompile";
import { TexProjectModel } from "@/model/prj/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { JoinResult } from "@/model/prj/JoinResult";
import { CompileQueue } from "@/model/prj/CompileQueue";
import { ProjInfo } from "@/model/prj/ProjInfo";
import { CompileStatus } from "@/model/prj/compile/CompileStatus";
import { ProjAttribute } from "@/model/prj/config/ProjAttribute";
import { PdfPosition } from "@/model/prj/pdf/PdfPosition";

export interface AppState {
    proj: {
        projList: TexProjectModel[],
        compileResult: CompileResult,
        latestComp: LatestCompile,
        joinResult: JoinResult,
        pdfUrl: string,
        logText: string,
        endSignal: string,
        queue: CompileQueue,
        tabName: string,
        streamLogText: string,
        projInfo: ProjInfo,
        compileStatus: CompileStatus,
        projAttr: ProjAttribute,
        pdfFocus: PdfPosition[]
    },
    tpl: {
        tplList: TemplateModel[],
        tplDetail: TemplateModel
    },
    file: {
        fileList: TexFileModel[],
        fileTree: TexFileModel[],
        activeFile: TexFileModel,
        selectItem: TexFileModel,
        mainFile: TexFileModel,
        fileCode: String
    }
}