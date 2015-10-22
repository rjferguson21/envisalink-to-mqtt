from node

RUN npm install -g coffee-script
COPY . /src
RUN cd /src; npm install

ENTRYPOINT ["coffee", "/src/index.coffee"]
