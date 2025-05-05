# TeXHub

## Introduce

This project is the frontend of TeXHub. TeXHub was the same as Overleaf/TeXPage that you can write LaTeX document online with collaboration. For now we have these component:

- TeXHub web(this project)
- the TeXHub backend provide rest api
- the TeXHub backend provide collaborate communication
- the LaTeX document render engine


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
