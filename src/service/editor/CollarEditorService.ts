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
import { UserService } from "rd-component";
import { readConfig } from "@/config/app/config-reader";
import { UserModel } from "rdjs-wheel";

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

export async function initEditor(
    projectId: string,
    docId: string,
    initContext: string,
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
    const wsProvider = new WebsocketProvider(readConfig("wssUrl"), docId, ydoc);
    const user: UserModel = await UserService.loadCurrUser(false, readConfig("refreshUserUrl"));
    wsProvider.awareness.setLocalStateField('user', {
        name: user.nickname,
        color: userColor.color,
        colorLight: userColor.light
    });
    wsProvider.on('status', (event: any) => {
        if (event.status === 'connected') {
            if (wsProvider.ws) {
                if (initContext && initContext.length > 0) {
                    ytext.insert(0, initContext);
                }
            }
        }
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
    const view = new EditorView({
        state,
        parent: edContainer.current,
    });
    return view;
}