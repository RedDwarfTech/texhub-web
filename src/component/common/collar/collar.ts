/**
 * this export is origin from the legacy import style like this:
 * import { SocketIOClientProvider } from "texhub-broadcast/dist/websocket/conn/socket_io_client_provider.js"
 *  I need to change the import style to the new one like this:
 *  import { SocketIOClientProvider } from 'texhub-broadcast';
 * and I have to change the import style in the whole project, so I create this file to export the SocketIOClientProvider 
 * in the furture only need to change the import style in this file.
 */
export { SocketIOClientProvider } from 'texhub-broadcast';
export { SingleClientProvider } from 'texhub-broadcast';
export { EditorView } from '@codemirror/view';
export { EditorState } from '@codemirror/state';
