FROM node

RUN npm install -g npm

WORKDIR /usr/workroot/

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN rm -fr kube

RUN npm run build

CMD [ "npm", "run", "start" ]