FROM alpine as builder
WORKDIR /app
RUN wget -O elm.gz https://github.com/elm/compiler/releases/download/0.19.1/binary-for-linux-64-bit.gz
RUN gunzip elm.gz
RUN chmod +x elm
RUN mv elm /usr/local/bin/
RUN mkdir dist
COPY index.html dist/index.html
COPY main.css dist/main.css
COPY src src
COPY elm.json elm.json
RUN elm make src/Main.elm
COPY main.js dist/main.js

FROM nginx as nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
