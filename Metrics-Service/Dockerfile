FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /metrics-service

ADD . /metrics-service/
WORKDIR /metrics-service/

# Install app dependencies
COPY package.json /metrics-service/
RUN cd /metrics-service

RUN npm install

EXPOSE 8080

CMD npm run prod
