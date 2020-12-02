FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /search-service

ADD . /search-service/
WORKDIR /search-service/

# Install app dependencies
COPY package.json /search-service/
RUN cd /search-service

RUN npm install

EXPOSE 8080

CMD npm run prod
