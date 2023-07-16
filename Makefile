start-server:
	docker run -d --rm --mount type=bind,source=$(shell pwd)/nginx.conf,target=/etc/nginx/conf.d/default.conf --mount type=bind,source=$(shell pwd),target=/usr/share/nginx/html -p 3000:80 nginx

debug:
	elm make --debug --output=main.js src/Main.elm

release:
	elm make --optimize --output=main.js src/Main.elm

watch:
	fswatch -o src | xargs -I{} make debug
