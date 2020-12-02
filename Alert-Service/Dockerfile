FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /alert-service

ADD . /alert-service/
WORKDIR /alert-service/

# Install app dependencies
COPY package.json /alert-service/
RUN cd /alert-service

RUN npm install

EXPOSE 8080

CMD npm run prod
