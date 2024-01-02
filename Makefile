PORT=8080
BUILD_NAME=ennoea

SRC_STATIC=static

BUILD_DIR=build
BUILD_STATIC=$(BUILD_DIR)/static

.PHONY: test

# Build entrypoint

build-all: build-dirs build-static build-server

# Build golang files

rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))
GO_CMD_FILES=$(wildcard cmd/$(BUILD_NAME)/*.go)
GO_FILES=$(GO_CMD_FILES) $(call rwildcard,pkg/,*.go)

build-server: build $(BUILD_DIR)/$(BUILD_NAME)

$(BUILD_DIR)/$(BUILD_NAME): $(GO_FILES)
	echo ${USER}; \
	which go; \
	go version; \
	go build -o $(BUILD_DIR)/$(BUILD_NAME) $(GO_CMD_FILES)

# Build static files

HTML_FILES=$(wildcard $(SRC_STATIC)/html/*)
IMAGE_FILES=$(wildcard $(SRC_STATIC)/images/*)
SCSS_FILES=$(wildcard $(SRC_STATIC)/css/*.scss)
JS_FILES=$(wildcard $(SRC_STATIC)/scripts/*.js)
SHADER_FILES=$(wildcard $(SRC_STATIC)/shaders/*)
DEPS_FOLDER=$(wildcard $(SRC_STATIC)/deps)

BUILD_JS_FILES=$(BUILD_STATIC)/scripts/index.min.js # Built using webpack
BUILD_CSS_FILES=$(addprefix $(BUILD_STATIC)/css/,$(notdir $(SCSS_FILES:.scss=.css)))
BUILD_HTML_FILES=$(addprefix $(BUILD_STATIC)/html/,$(notdir $(HTML_FILES)))
BUILD_IMAGE_FILES=$(addprefix $(BUILD_STATIC)/images/,$(notdir $(IMAGE_FILES)))
BUILD_SHADER_FILES=$(addprefix $(BUILD_STATIC)/shaders/,$(notdir $(SHADER_FILES)))

build-static: node_modules build-dirs move-deps $(BUILD_JS_FILES) $(BUILD_CSS_FILES) $(BUILD_HTML_FILES) $(BUILD_IMAGE_FILES) $(BUILD_SHADER_FILES)

build-dirs: build build/static/css build/static/html build/static/images build/static/scripts build/static/shaders

build:
	mkdir ./build

build/static/css:
	mkdir -p ./build/static/css
	
build/static/html:
	mkdir -p ./build/static/html

build/static/images:
	mkdir -p ./build/static/images

build/static/scripts:
	mkdir -p ./build/static/scripts

build/static/shaders:
	mkdir -p ./build/static/shaders

move-deps: build/static/css
	cp -r $(DEPS_FOLDER)/css/* ./build/static/css

build/static/scripts/%.js: $(JS_FILES)
	./node_modules/.bin/webpack --config webpack.config.js

build/static/css/%.css: $(SCSS_FILES)
	./node_modules/.bin/sass --style=compressed --no-source-map $< $@

build/static/html/%: $(SRC_STATIC)/html/%
	cp $< $@

build/static/images/%: $(SRC_STATIC)/images/%
	cp $< $@

build/static/shaders/%: $(SRC_STATIC)/shaders/%
	cp $< $@

# Other tools

start: build
	./$(BUILD_DIR)/$(BUILD_NAME) --port=$(PORT) --static=$(BUILD_DIR)/static

deps: node_modules

node_modules:
	npm install

clean-all: clean clean-deps

clean: clean-build clean-test

clean-build:
	rm -rf build

clean-deps:
	rm -rf node_modules

clean-test:
	rm -rf test

# Testing

TEST_DIR=test
TEST_BIN=$(TEST_DIR)/bin
TEST_COVER=$(TEST_DIR)/cover

test: test-compile test-run

test-dirs: $(TEST_BIN) $(TEST_COVER)

$(TEST_BIN):
	mkdir -p $(TEST_BIN)

$(TEST_COVER):
	mkdir -p $(TEST_COVER)

test-compile: test-dirs
	for PACKAGE in `go list ./...`; do \
		go test --cover --covermode=count -v -c \
			$${PACKAGE} -o $(TEST_BIN)/`basename $${PACKAGE}.test`; \
	done

test-run: test-dirs
	cd $(TEST_DIR) && \
	for TEST in `find bin/ -name '*.test'`; do \
		FILENAME="`basename -s .test $${TEST}`.cover" && \
		./$${TEST} -test.coverprofile="cover/$${FILENAME}"; \
	done

cover: test-compile test-run $(TEST_COVER)/all.cover test-cover

$(TEST_COVER)/all.cover:
	cd $(TEST_COVER) && \
	rm -f all.cover && \
	COVER_FILES=`find . -name '*.cover'` && \
	echo "mode: count" > all.cover && \
	for COVER in $${COVER_FILES}; do \
		tail -n +2 $${COVER} >> all.cover; \
	done

test-cover: $(TEST_COVER)/all.cover
	go tool cover -html=$(TEST_COVER)/all.cover
