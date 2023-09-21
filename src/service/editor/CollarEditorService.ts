import { EditorView } from "@codemirror/view";
import { WebsocketProvider } from "y-websocket";
import * as Y from 'yjs';
import * as random from 'lib0/random';
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { yCollab } from "y-codemirror.next";
import { StreamLanguage, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { solarizedLight } from 'cm6-theme-solarized-light';
import { readConfig } from "@/config/app/config-reader";
import { UserModel, WheelGlobal } from "rdjs-wheel";
import { toast } from "react-toastify";

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
export const userColor = usercolors[random.uint32() % usercolors.length];
const wsMaxRetries = 3;
let wsRetryCount = 0;
const extensions = [
    EditorView.contentAttributes.of({ spellcheck: 'true' }),
    EditorView.lineWrapping,
    EditorView.theme({
        '.cm-content': {
            fontSize: '16px'
        },
        '.cm-scroller': {

        },
    }),
    StreamLanguage.define(stex),
    syntaxHighlighting(defaultHighlightStyle),
];

export function initEditor(
    projectId: string,
    docId: string,
    activeEditorView: EditorView | undefined,
    edContainer: any) {
    if (activeEditorView) {
        activeEditorView.destroy();
    }
    let docOpt = {
        guid: docId,
        collectionid: projectId
    };
    const ydoc = new Y.Doc(docOpt);
    const ytext = ydoc.getText(docId);
    const undoManager = new Y.UndoManager(ytext);
    const wsProvider = new WebsocketProvider(readConfig("wssUrl"), docId, ydoc, {
        maxBackoffTime: 1000000,
        params: {
            // https://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#query-param
            access_token: localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME) ?? ""
        }
    });
    const uInfo = localStorage.getItem("userInfo");
    if (!uInfo) {
        console.error("user info is null",uInfo);
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
    wsProvider.on('connection-error', (event: any) => {
        wsProvider.shouldConnect = false;
        wsProvider.ws?.close()
    });
    wsProvider.on('message',(event: MessageEvent)=>{
        console.log(event.data);
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
            toast.error("无法建立实时协作连接");
            return;
        }
    });
    ydoc.on('update', () => {
        // console.log("update");
    });
    const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
            basicSetup,
            yCollab(ytext, wsProvider.awareness, { undoManager }),
            extensions,
            solarizedLight
        ]
    });
    if (edContainer.current && edContainer.current.children && edContainer.current.children.length > 0) {
        return;
    }
    const view = new EditorView({
        state,
        parent: edContainer.current,
    });
    return view;
}