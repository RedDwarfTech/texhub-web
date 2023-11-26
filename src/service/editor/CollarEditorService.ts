import { EditorView, Decoration, ViewUpdate } from "@codemirror/view";
// @ts-ignore
import { WebsocketProvider } from "y-websocket";
import * as Y from 'yjs';
import * as random from 'lib0/random';
import * as decoding from 'lib0/decoding'
import { Compartment, EditorState, Extension, StateEffect, StateField, Range } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { SearchCursor } from "@codemirror/search"
import { yCollab } from "y-codemirror.next";
import { CompletionContext, autocompletion } from "@codemirror/autocomplete";
import { StreamLanguage, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { solarizedLight } from 'cm6-theme-solarized-light';
import { readConfig } from "@/config/app/config-reader";
import { RequestHandler, ResponseHandler, UserModel, WheelGlobal } from "rdjs-wheel";
import { toast } from "react-toastify";
import { EditorAttr } from "@/model/proj/config/EditorAttr";
import { basicLight } from 'cm6-theme-basic-light';
import { RefObject } from "react";
export const themeMap: Map<string, Extension> = new Map<string, Extension>();
themeMap.set('Solarized Light', solarizedLight);
themeMap.set('Basic Light', basicLight);

export const usercolors = [
    { color: '#30bced', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' }
];
export const themeConfig = new Compartment()
export const userColor = usercolors[random.uint32() % usercolors.length];
const wsMaxRetries = 1;
let wsRetryCount = 0;
let curEditorView: EditorView|null= null;
let curStart: number = 0;
let curEnd: number = 0;
let clearCount: number = 0;
const highlight_effect = StateEffect.define<Range<Decoration>[]>();
const extensions = [
    EditorView.contentAttributes.of({ spellcheck: 'true' }),
    EditorView.lineWrapping,
    EditorView.theme({
        "&": { height: "100%" },
        '.cm-content': {
            fontSize: '16px'
        },
        '.cm-selectionMatch': {
            backgroundColor: "#A3BE8C"
        },
        '.cm-scroller': {

        },
    }),
    StreamLanguage.define(stex),
    syntaxHighlighting(defaultHighlightStyle),
    EditorView.updateListener.of(function (e) {
        //  input/update/change event
        let selection = e.state.selection;
        let start = selection.ranges[0].from;
        let end = selection.ranges[0].to;
        if (start < end && (curStart !== start || curEnd !== end)) {
            clearCount = 0;
            curStart = start;
            curEnd = end;
            hightlightSelection(start, end)
        }
        if(start === end && clearCount<2) {
            clearCount = clearCount + 1;
            highlightUnselection();
        }
    })
];

const hightlightWord = (word: string) => {
    if (!curEditorView) {
        return;
    }
    const highlight_decoration = Decoration.mark({
        attributes: { style: "background-color: yellow" }
    });
    let cursor = new SearchCursor(curEditorView.state.doc, word);
    cursor.next();
    curEditorView.dispatch({
        effects: highlight_effect.of([highlight_decoration.range(cursor.value.from, cursor.value.to)])
    });
}

const hightlightSelection = (from: number, to: number) => {
    if (!curEditorView) {
        return;
    }
    const highlight_decoration = Decoration.mark({
        attributes: { style: "background-color: yellow" }
    });
    curEditorView.dispatch({
        effects: highlight_effect.of([highlight_decoration.range(from, to)])
    });
}

const highlightUnselection = () => {
    if (!curEditorView) {
        return;
    }
    const filterMarks = StateEffect.define();
    curEditorView.dispatch({
        effects: filterMarks.of(null)
    })
}

const handleWsAuth = (event: any, wsProvider: WebsocketProvider, ydoc: Y.Doc, docId: string) => {
    if (event.status === 'failed') {
        toast.error("access token授权失败");
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close()
    }
    if (event.status === 'expired') {
        debugger
        toast.error("access token授权过期");
        RequestHandler.handleWebAccessTokenExpire().then((res) => {
            if (ResponseHandler.responseSuccess(res)) {
                wsProvider.ws?.close();
                wsProvider = doWsConn(ydoc, docId);
            } else {
                wsProvider.shouldConnect = false;
                wsProvider.ws?.close();
            }
        })
    }
}

const doWsConn = (ydoc: Y.Doc, docId: string): WebsocketProvider => {
    const wsProvider: WebsocketProvider = new WebsocketProvider(readConfig("wssUrl"), docId, ydoc, {
        maxBackoffTime: 1000000,
        params: {
            // https://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#query-param
            access_token: localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME) ?? ""
        }
    });
    const uInfo = localStorage.getItem("userInfo");
    if (!uInfo) {
        console.error("user info is null", uInfo);
        return;
    };
    const user: UserModel = JSON.parse(uInfo);
    const ydocUser = {
        name: user.nickname,
        color: userColor.color,
        colorLight: userColor.light
    };
    const permanentUserData = new Y.PermanentUserData(ydoc);
    permanentUserData.setUserMapping(ydoc, ydoc.clientID, ydocUser.name)
    wsProvider.awareness.setLocalStateField('user', ydocUser);
    wsProvider.on('auth', (event: any) => {
        // https://discuss.yjs.dev/t/how-to-refresh-the-wsprovider-params-when-token-expire/2131
        handleWsAuth(event, wsProvider, ydoc, docId);
    });
    wsProvider.on('connection-error', (event: any) => {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close()
    });
    wsProvider.on('message', (event: MessageEvent) => {
        const data: Uint8Array = new Uint8Array(event.data);
        const decoder = decoding.createDecoder(data)
        const messageType = decoding.readVarUint(decoder)
    });
    wsProvider.on('status', (event: any) => {
        if (event.status === 'connected') {
            if (wsProvider.ws) {

            }
        } else if (event.status === 'disconnected' && wsRetryCount < wsMaxRetries) {
            wsRetryCount++;
            setTimeout(() => {
                wsProvider.connect();
            }, 2000);
        } else {
            wsProvider.destroy();
            return;
        }
    });
    return wsProvider;
}

function myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/[\\w\\]+/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit)
        return null
    return {
        from: word.from,
        options: [
            { label: "match", type: "keyword" },
            { label: "hello", type: "variable", info: "(World)" },
            { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" },
            { label: "\\begin{document}", type: "text", apply: "\begin{document}" },
            { label: "\\section", type: "text", apply: "\section" },
            { label: "\\subsection", type: "text", apply: "\subsection" },
        ]
    }
}

export function initEditor(editorAttr: EditorAttr,
    activeEditorView: EditorView | undefined,
    edContainer: RefObject<HTMLDivElement>): [EditorView | undefined, WebsocketProvider] {
    if (activeEditorView) {
        activeEditorView.destroy();
    }
    let docOpt = {
        guid: editorAttr.docId,
        collectionid: editorAttr.projectId
    };
    const ydoc = new Y.Doc(docOpt);
    const ytext = ydoc.getText(editorAttr.docId);
    const undoManager = new Y.UndoManager(ytext);
    let wsProvider: WebsocketProvider = doWsConn(ydoc, editorAttr.docId);
    ydoc.on('update', (update, origin) => {
        try {
            let parsed = Y.decodeUpdate(update);
        } catch (e) {
            console.log(e);
        }
    });
    const highlight_extension = StateField.define({
        create() { return Decoration.none },
        update(value, transaction) {
            value = value.map(transaction.changes)
            for (let effect of transaction.effects) {
                if (effect.is(highlight_effect) && effect.value) {
                    value = value.update({ add: effect.value, sort: true })
                }
            }
            return value
        },
        provide: f => EditorView.decorations.from(f)
    });
    const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
            basicSetup,
            yCollab(ytext, wsProvider.awareness, { undoManager }),
            extensions,
            themeConfig.of(themeMap.get("Solarized Light")!),
            autocompletion({ override: [myCompletions] }),
            highlight_extension
        ],
    });
    if (edContainer.current && edContainer.current.children && edContainer.current.children.length > 0) {
        return [undefined, undefined];
    }
    const editorView: EditorView = new EditorView({
        state,
        parent: edContainer.current!,
    });
    curEditorView = editorView;
    return [editorView, wsProvider];
}