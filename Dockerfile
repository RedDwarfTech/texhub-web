FROM nginx:1.25.1-alpine-slim

LABEL org.reddwarf.image.authors="jiangtingqiang@gmail.com"

ENV LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    TZ=Asia/Shanghai

ADD build /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]