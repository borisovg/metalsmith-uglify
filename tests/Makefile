all: test

## clean:  delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf coverage
	rm -rf node_modules
	rm -f npm-debug.log

## test:   run the tests (default target)
.PHONY: test
test: node_modules
	DEBUG=metalsmith-uglify:*,-metalsmith-uglify:call_uglify \
	./node_modules/.bin/istanbul cover \
		-i index.js \
		--root ../ \
		node_modules/.bin/_mocha index.spec.js
	./node_modules/.bin/istanbul report text

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
