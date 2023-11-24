
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
