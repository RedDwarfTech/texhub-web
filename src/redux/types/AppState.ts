import { CompileResult } from "@/model/doc/CompileResult";
import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";

export interface AppState {
    proj: {
        projList: TexProjectModel[],
        compileResult: CompileResult
    },
    tpl: {
        tplList: TemplateModel[],
        tplDetail: TemplateModel
    },
    file: {
        fileList: TexFileModel[],
        fileTree: TexFileModel[],
        file: TexFileModel
    }
}