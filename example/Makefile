all: build

## build:  build example page (default target)
.PHONY: build
build: node_modules
	DEBUG=metalsmith-inline-css:* node build.js \
		&& ./node_modules/.bin/open-cli ./public/index.html

## clean:   delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf node_modules
	rm -f npm-debug.log pnpm-lock.yaml
	rm -rf public

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	pnpm update || (rm -rf $@; exit 1)
	touch $@
