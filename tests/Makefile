all: test

LCOV = coverage/coverage.lcov

## clean:  delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf \
		.nyc_output \
		../node_modules/.cache/nyc \
		coverage \
		node_modules
	rm -f npm-debug.log

## test:   run the tests (default target)
.PHONY: test
test: node_modules
	DEBUG=metalsmith-uglify:info:* ./node_modules/.bin/nyc \
		--cwd ../ \
		--exclude tests/** \
		--reporter=html \
		--reporter=text \
		--temp-directory ./tests/.nyc_output \
		node_modules/.bin/mocha index.spec.js

.PHONY: coverage
coverage:
	./node_modules/.bin/nyc report \
		--cwd ../ \
		--temp-directory ./tests/.nyc_output \
		--reporter=text-lcov \
		> $(LCOV)
	./node_modules/.bin/codecov \
		-f $(LCOV)

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
