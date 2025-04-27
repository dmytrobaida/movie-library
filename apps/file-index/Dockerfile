FROM node:23-slim

WORKDIR /
RUN apt update && apt install -y --no-install-recommends ca-certificates fonts-liberation gconf-service libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
  libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxshmfence1 libxss1 libxtst6 lsb-release wget xdg-utils unzip

RUN wget -q --show-progress 'https://playwright.azureedge.net/builds/chromium/1151/chromium-linux-arm64.zip' -O chromium-linux-arm64.zip && unzip chromium-linux-arm64.zip && rm -f ./chromium-linux-arm64.zip

WORKDIR /app
RUN corepack enable
COPY package.json .
COPY .yarnrc.yml .
RUN yarn install

COPY . .
RUN yarn prisma:generate
RUN yarn build

EXPOSE 3000
CMD ["sh", "./start.sh"]
