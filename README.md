# TeXHub

## Introduce

This project is the frontend of TeXHub. TeXHub was the same as Overleaf/TeXPage that you can write LaTeX document online with collaboration. For now we have these component:

- TeXHub web(this project)
- the TeXHub backend provide rest api
- the TeXHub backend provide collaborate communication
- the LaTeX document render engine

## Components

The main tech stack of the TeXHub Web frontend:

| Category | Technology | Version | Description |
| --- | --- | --- | --- |
| Core | React | 18.2.0 | UI framework |
| Core | React DOM | 18.2.0 | DOM rendering |
| Core | TypeScript | ^5.9 | Static type checking |
| Build | Vite | ^7.3 | Dev server and production build |
| Routing | React Router DOM | ^7.14 | Single-page application routing |
| State | Redux | ^5.0 | Global state container |
| State | Redux Toolkit | ^2.11 | Redux utilities |
| State | React Redux | 9.2.0 | React bindings for Redux |
| Editor | CodeMirror 6 | ^6.0 | LaTeX source editor core |
| Editor | rdy-codemirror.next | ^0.3 | TeXHub custom CodeMirror wrapper |
| Editor | cm6-theme-* | ^0.2 | Editor themes |
| PDF | pdfjs-dist | 5.4.296 | PDF rendering engine |
| PDF | react-pdf | ^10.4 | React PDF component wrapper |
| HTTP | Axios | ^1.16 | HTTP client |
| Collaboration | socket.io-client | ^4.8 | WebSocket communication |
| Collaboration | texhub-broadcast | 1.0.134 | TeXHub collaboration broadcast layer |
| i18n | i18next | ^26.0 | Internationalization framework |
| i18n | react-i18next | ^17.0 | React bindings for i18next |
| Internal | rdyjs / rdlib0 / rdjs-wheel | — | RedDwarf internal base libraries |

## Develop

develop this project：

```bash
git clone https://github.com/RedDwarfTech/texhub-web.git
# install the dependencies
pnpm install
# start develop server
pnpm run dev
# start the nginx in local machine(macOS 13.4)
/opt/homebrew/opt/nginx/bin/nginx -c /System/Volumes/Data/opt/homebrew/etc/nginx/nginx.conf
# reload the configuration
/opt/homebrew/opt/nginx/bin/nginx -s reload -c /System/Volumes/Data/opt/homebrew/etc/nginx/nginx.conf
```
