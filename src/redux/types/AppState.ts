import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";

export interface AppState {
    doc: {
        docList: TexProjectModel[]
    },
    tpl: {
        tplList: TemplateModel[],
        tplDetail: TemplateModel
    },
    file: {
        fileList: TexFileModel[]
    }
}