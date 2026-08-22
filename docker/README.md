# BackstopJS Docker Image

A self-contained Docker image to run [BackstopJS](https://github.com/garris/BackstopJS) with no external dependencies.

[Visual Regression Testing with BackstopJS in a Docker container](https://blog.docksal.io/visual-regression-testing-with-backstopjs-in-a-docker-container-dfd1b9ae8582)

The image contains BackstopJS, Node.js 24 LTS, a system Chromium for the
Puppeteer engine and the version-matched Playwright browsers.


## Usage

Use this image as if you were using a binary.  
Working directory is expected to be mounted at `/src` in the container.

```sh
docker run --rm -v "$(pwd):/src" backstopjs/backstopjs --version

# On Windows use:
$(pwd -W)
```

You can also add a shell alias (in `.bashrc`, `.zshrc`, etc.) for convenience.

```sh
alias backstop='docker run --rm --ipc=host -v "$(pwd):/src" backstopjs/backstopjs "$@"'
```

Restart your shell or open a new one, then

```
$ backstopjs --version
BackstopJS v3.x.x
```


## Sample test

```sh
docker run --rm --ipc=host -v "$(pwd):/src" backstopjs/backstopjs init
docker run --rm --ipc=host -v "$(pwd):/src" backstopjs/backstopjs reference
docker run --rm --ipc=host -v "$(pwd):/src" backstopjs/backstopjs test
```


## Browser engines

Puppeteer uses the Debian Chromium installed at `/usr/bin/chromium`.
Playwright uses its own version-matched Chromium, Firefox and WebKit builds.


## Limitations

`backstop openReport` is not (yet) supported.


## Debugging

The following command will start a bash session in the container.

```sh
docker run --rm --ipc=host -v "$(pwd):/src" -it --entrypoint=bash backstopjs/backstopjs
```


## Jenkins Guide
You could get a Jenkins Guide here: [Jenkins Guide](../examples/Jenkins)

## MultiArch Build

Your docker setup should have buildx support to be able to build that.

```
docker buildx create --name mybuilder --use --bootstrap
```

Build + Push:

```
export BACKSTOPJS_VERSION=6.1.4
docker buildx build --push --build-arg BACKSTOPJS_VERSION --platform linux/amd64,linux/arm64 --tag backstopjs/backstopjs:$BACKSTOPJS_VERSION -f docker/Dockerfile .

```

### local load to your registry

build + load it to your registry (load does not support more than 1 platform, push does https://github.com/docker/buildx/issues/59):

AMD64:

```
export BACKSTOPJS_VERSION=6.1.4
docker buildx build --build-arg BACKSTOPJS_VERSION --platform linux/amd64 --load --tag backstopjs/backstopjs:$BACKSTOPJS_VERSION -f docker/Dockerfile .
```

ARM64:

```
export BACKSTOPJS_VERSION=6.1.4
docker buildx build --build-arg BACKSTOPJS_VERSION --platform linux/arm64 --load --tag backstopjs/backstopjs:$BACKSTOPJS_VERSION -f docker/Dockerfile .
```
