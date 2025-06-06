import { RemoteCompileResult } from "@/model/proj/RemoteCompileResult";
import { LatestCompile } from "@/model/proj/LatestCompile";
import { TexProjectModel } from "@/model/proj/TexProjectModel";
import { TexFileModel } from "@/model/file/TexFileModel";
import { TemplateModel } from "@/model/tpl/TemplateModel";
import { JoinResult } from "@/model/proj/JoinResult";
import { CompileQueue } from "@/model/proj/CompileQueue";
import { ProjInfo } from "@/model/proj/ProjInfo";
import { CompileStatus } from "@/model/proj/compile/CompileStatus";
import { PreviewPdfAttribute } from "@/model/proj/config/PreviewPdfAttribute";
import { PdfPosition } from "@/model/proj/pdf/PdfPosition";
import { EntityList } from "rdjs-wheel";
import { SrcPosition } from "@/model/proj/pdf/SrcPosition";
import { ProjConf } from "@/model/proj/config/ProjConf";
import { SearchResult } from "@/model/proj/search/SearchResult";
import { ProjHisotry } from "@/model/proj/history/ProjHistory";
import { TexProjects } from "@/model/proj/TexProjects";
import { TexSnippetModel } from "@/model/snippet/TexSnippetModel";
import * as Y from 'rdyjs';
import { ProjCollarModel } from "@/model/proj/share/ProjCollarModel";
import { EditorView } from "codemirror";
import { CompileResultType } from "@/model/proj/compile/CompileResultType";
import { SocketIOClientProvider } from "@/component/common/collar/collar";

/**
 * the legacy proj contains too much state fields that make
 * the application has too many unexpect rerender
 * so try to split more precisely
 * from proj => projTree
 * from proj => projEditor
 */
export interface AppState {
    proj: {
        projList: TexProjects,
        folderProjList: TexProjectModel[],
        remoteCompileResult: RemoteCompileResult,
        latestComp: LatestCompile,
        joinResult: JoinResult,
        texPdfUrl: string,
        logText: string,
        endSignal: string,
        queue: CompileQueue,
        tabName: string,
        streamLogText: string,
        projInfo: ProjInfo,
        compileStatus: CompileStatus,
        projAttr: PreviewPdfAttribute,
        pdfFocus: PdfPosition[],
        srcFocus: SrcPosition[],
        projConf: ProjConf,
        activeShare: false,
        projHistories: ProjHisotry[],
        insertContext: string,
        projHisPage: EntityList<ProjHisotry>,
        replaceContext: string,
        curHistory: ProjHisotry,
    },
    projEditor: {
        curRootYDoc: Y.Doc,
        curSubYDoc: Y.Doc,
        editorView: EditorView,
        texEditorSocketIOWs: SocketIOClientProvider,
        connState: string,
        editorText: string
    },
    projTree: {
        hits: SearchResult[],
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
        mainFile: TexFileModel,
        addFileResp: any
    },
    snippet: {
        snippets: TexSnippetModel[],
    },
    projShare: {
        collar: ProjCollarModel[]
    },
    preview: {
        curPage: number,
        fullscreenFlag: boolean,
        compileResultType: CompileResultType
    }
}