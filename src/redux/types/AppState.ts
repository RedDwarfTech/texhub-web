import { CompileResult } from "@/model/prj/CompileResult";
import { LatestCompile } from "@/model/prj/LatestCompile";
import { TexProjectModel } from "@/model/prj/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { JoinResult } from "@/model/prj/JoinResult";

export interface AppState {
    proj: {
        projList: TexProjectModel[],
        compileResult: CompileResult,
        latestComp: LatestCompile,
        joinResult: JoinResult,
        pdfUrl: string,
        logText: string,
        endSignal: string
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