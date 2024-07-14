#### 本地开发



本机启动nginx服务：



```bash
/opt/homebrew/Cellar/nginx/1.25.4/bin/nginx -c /System/Volumes/Data/opt/homebrew/etc/nginx/nginx.conf
```



server start openresty:

```bash
/usr/local/openresty/bin/openresty -c /usr/local/openresty/nginx/conf/nginx.conf
```

```bash
docker pull --platform linux/x86_64 docker.io/bitnami/redis:7.0.8-debian-11-r13
docker tag docker.io/bitnami/redis:7.0.8-debian-11-r13 registry.cn-hangzhou.aliyuncs.com/reddwarf-public/redis:7.0.8-debian-11-r13
docker push registry.cn-hangzhou.aliyuncs.com/reddwarf-public/redis:7.0.8-debian-11-r13


docker pull --platform linux/x86_64 docker.io/bitnami/mysql:8.0.26-debian-10-r10
docker tag docker.io/bitnami/mysql:8.0.26-debian-10-r10 registry.cn-hangzhou.aliyuncs.com/reddwarf-public/mysql:8.0.26-debian-10-r10
docker tag docker.io/bitnami/mysql:8.0.26-debian-10-r10 registry.cn-shanghai.aliyuncs.com/reddwarf-public/mysql:8.0.26-debian-10-r10
docker push registry.cn-hangzhou.aliyuncs.com/reddwarf-public/mysql:8.0.26-debian-10-r10
docker tag registry.cn-hangzhou.aliyuncs.com/reddwarf-pro/dolphin-post:a56aeb198d9d4dc5548aa6d7ce6ede8890035e00 registry.cn-shanghai.aliyuncs.com/reddwarf-pro/dolphin-post:a56aeb198d9d4dc5548aa6d7ce6ede8890035e00
docker push registry.cn-shanghai.aliyuncs.com/reddwarf-pro/dolphin-post:a56aeb198d9d4dc5548aa6d7ce6ede8890035e00
```

从宿主机上查看Traefik转发是否生效：

```bash
curl http://127.0.0.1:8000 --header "Host:tex.poemhub.top"
curl http://172.29.217.209:8000 --header "Host:tex.poemhub.top"
```

本机转发配置：

```bash
server {
    listen 80;
	server_name dev-tex.poemhub.top;

	location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    location ^~ /tex/ {
        proxy_pass  http://127.0.0.1:8000/tex/;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ^~ /infra/ {
        proxy_pass  https://tex.poemhub.top/infra/;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /tex/static/proj {
        proxy_pass  https://tex.poemhub.top/tex/static/proj/;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /tex/project/compile/qlog {
        proxy_cache off;
        proxy_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600;
        proxy_pass https://tex.poemhub.top/texpub/;
    }
}
```


