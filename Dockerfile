FROM reg.hydevops.com/3th_party/nginx:1.19.2-alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./packages/AppEntry/dist /usr/share/nginx/html

EXPOSE 80
