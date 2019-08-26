FROM node:10.16.3
LABEL maintainer="Kalan<kjj6198@gmail.com>"

RUN mkdir -p  /hubot
COPY . /hubot

WORKDIR /hubot
RUN npm install -g pm2@3.5.1
RUN npm install --ignore-script --production

ENV NODE_ENV production
ENV PORT 80

CMD ["pm2-docker", "./dist/app.js"]