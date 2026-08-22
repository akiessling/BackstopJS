ARG NODE_VERSION=24.19.0

FROM node:${NODE_VERSION}-bookworm AS backstopjs-package

WORKDIR /tmp/backstopjs-source
COPY . .
RUN mkdir /tmp/backstopjs-package && npm pack --pack-destination /tmp/backstopjs-package

FROM node:${NODE_VERSION}-bookworm

ARG BACKSTOPJS_VERSION
ARG DEBIAN_FRONTEND=noninteractive

ENV BACKSTOPJS_VERSION=${BACKSTOPJS_VERSION} \
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  PUPPETEER_SKIP_DOWNLOAD=true

# Install the system Chromium used by Puppeteer plus fonts required for
# deterministic screenshots. Playwright installs its version-matched browsers
# and remaining system libraries below.
RUN apt-get -qq update >/dev/null && apt-get install -qq --no-install-recommends \
  chromium \
  fonts-liberation \
  fonts-arphic-ukai \
  fonts-arphic-uming \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
  fonts-noto-cjk \
  fonts-noto-color-emoji \
  fonts-unfonts-core \
  fonts-unfonts-extra \
  fonts-vlgothic \
  fonts-wqy-zenhei \
  tini \
  xfonts-wqy \
  >/dev/null \
  && apt-get -qq clean >/dev/null \
  && rm -rf /var/lib/apt/lists/*

COPY --from=backstopjs-package /tmp/backstopjs-package/backstopjs-*.tgz /tmp/backstopjs.tgz
RUN mkdir -p "${PLAYWRIGHT_BROWSERS_PATH}" \
  && npm install --global --omit=dev /tmp/backstopjs.tgz \
  && node /usr/local/lib/node_modules/backstopjs/node_modules/playwright/cli.js install --with-deps \
  && rm /tmp/backstopjs.tgz \
  && apt-get -qq clean >/dev/null \
  && rm -rf /var/lib/apt/lists/* /root/.npm

WORKDIR /src

ENTRYPOINT ["tini", "--", "backstop"]
