import { useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import styles from "./CollarCodeEditor.module.css";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  StreamLanguage,
} from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { EditorState } from "@codemirror/state";
import { javascript } from '@codemirror/lang-javascript';
import * as random from 'lib0/random';
import { WebsocketProvider } from 'y-websocket';
import React from "react";
import { AppState } from "@/redux/types/AppState";
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';

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

    },
    '.cm-scroller': {
      maxHeight: '100vh',
      minHeight: '100vh',
    },
  }),
  StreamLanguage.define(stex),
  syntaxHighlighting(defaultHighlightStyle),
];

export type EditorProps = {
  projectId: string;
  docId: string;
};

const CollarCodeEditor: React.FC<EditorProps> = (props: EditorProps) => {
  const edContainer = useRef<any>();
  const { file } = useSelector((state: AppState) => state.file);
  const [activeEditorView, setActiveEditorView] = useState<EditorView>();

  React.useEffect(() => {
    const view = initEditor(props.projectId, props.docId);
    setActiveEditorView(view);
   return () => {
      view.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (!file || !file.file_id) return;
    const view = initEditor(props.projectId, file.file_id);
    setActiveEditorView(view);
    return () => {
      view.destroy();
    };
  }, [file]);

  const initEditor = (projectId: string, docId: string): EditorView => {
    if(activeEditorView){
      activeEditorView.destroy();
    }
    let docOpt = {
      guid: docId,
      collectionid: projectId
    };
    const ydoc = new Y.Doc(docOpt);
    const ytext = ydoc.getText(docId);
    const undoManager = new Y.UndoManager(ytext);
    const wsProvider = new WebsocketProvider('wss://ws.poemhub.top', projectId, ydoc);
    wsProvider.awareness.setLocalStateField('user', {
      name: 'Anonymous ' + Math.floor(Math.random() * 100),
      color: userColor.color,
      colorLight: userColor.light
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        yCollab(ytext, wsProvider.awareness, { undoManager })
      ]
    });
    const view = new EditorView({
      state,
      parent: edContainer.current,
      extensions: [basicSetup, extensions]
    });
    return view;
  }

  return <div ref={edContainer} className={styles.container}>
  </div>;
}

export default CollarCodeEditor;