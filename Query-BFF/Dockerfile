FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /query-bff

ADD . /query-bff/
WORKDIR /query-bff/

# Install app dependencies
COPY package.json /query-bff/
RUN cd /query-bff

RUN npm install

EXPOSE 8080

CMD npm run prod
