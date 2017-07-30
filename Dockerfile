FROM node

WORKDIR /usr/workroot/

COPY package.json .

RUN npm install

COPY . .

RUN rm -fr kube

RUN npm run build

CMD [ "npm", "run", "start" ]