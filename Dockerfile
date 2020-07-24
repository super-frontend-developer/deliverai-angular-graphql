# Stage 1: Build project
FROM node:alpine AS build
LABEL maintainer="Vadim Fedorenko <meiblorn@gmail.com>"

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build:prod

# Stage 2: Deploy to nginx
FROM nginx:alpine
LABEL maintainer="Vadim Fedorenko <meiblorn@gmail.com>"

COPY --from=build /app/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/deliverai-frontend-web-dashboard /usr/share/nginx/html
