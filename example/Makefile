all: example

## clean:   delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf node_modules
	rm -f npm-debug.log
	rm -rf public

## example:  build example page (default target)
.PHONY: example
example: node_modules
	DEBUG=metalsmith-uglify:*,-metalsmith-uglify:call_uglify node build.js \
		&& ./node_modules/.bin/opn ./public/index.html

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	@echo 'This will take a while ...'
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
