import { TexDocModel } from "@/model/doc/TexDocModel";

export interface AppState {
    doc: {
        docList: TexDocModel[]
    }
}