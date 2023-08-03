import { TexDocModel } from "@/model/doc/TexDocModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";

export interface AppState {
    doc: {
        docList: TexDocModel[]
    },
    tpl: {
        tplList: TemplateModel[]
    }
}