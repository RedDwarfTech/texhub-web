import { CompileResult } from "@/model/proj/CompileResult";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { JoinResult } from "@/model/proj/JoinResult";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { ProjAttribute } from "@/model/proj/config/ProjAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { EntityList } from "rdjs-wheel";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { SearchResult } from "@/model/proj/search/SearchResult";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { TexProjects } from "@/model/proj/TexProjects";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import * as Y from 'yjs';
import { ProjCollarModel } from "@/model/proj/share/ProjCollarModel";
import { EditorView } from "codemirror";
import { WebsocketProvider } from "rdy-websocket";

export interface AppState {
    proj: {
        projList: TexProjects,
        folderProjList: TexProjectModel[],
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
        pdfFocus: PdfPosition[],
        srcFocus: SrcPosition[],
        projConf: ProjConf,
        hits: SearchResult[],
        activeShare: false,
        projHistories: ProjHisotry[],
        insertContext: string,
        projHisPage: EntityList<ProjHisotry>,
        curYDoc: Y.Doc,
        replaceContext: string,
        curHistory: ProjHisotry,
        connState: string,
    },
    tpl: {
        tplList: TemplateModel[],
        tplPage: EntityList<TemplateModel>,
        tplDetail: TemplateModel
    },
    file: {
        fileList: TexFileModel[],
        fileTree: TexFileModel[],
        curFileTree: TexFileModel[]
        folderTree: TexFileModel,
        activeFile: TexFileModel,
        treeSelectItem: TexFileModel,
        mainFile: TexFileModel
    },
    snippet: {
        snippets: TexSnippetModel[],
    },
    projShare: {
        collar: ProjCollarModel[]
    },
    editor: {
        editor: EditorView,
        ws: WebsocketProvider
    }
}