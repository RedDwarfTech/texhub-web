import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";

export interface AppState {
    proj: {
        projList: TexProjectModel[]
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