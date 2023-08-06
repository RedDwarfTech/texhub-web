import { TexProjectModel } from "@/model/doc/TexProjectModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";

export interface AppState {
    doc: {
        docList: TexProjectModel[]
    },
    tpl: {
        tplList: TemplateModel[],
        tplDetail: TemplateModel
    }
}