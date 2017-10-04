all: help

## clean:    delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf node_modules
	rm -f npm-debug.log
	cd example && make clean
	cd tests && make clean

## example:  build example page
.PHONY: example
example: node_modules
	cd example && make

## test:     run tests
.PHONY: test
test: node_modules
	cd tests && make

.PHONY: coverage
coverage:
	cd tests && make coverage

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
