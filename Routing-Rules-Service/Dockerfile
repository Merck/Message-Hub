FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /routing-rules-service

ADD . /routing-rules-service/
WORKDIR /routing-rules-service/

# Install app dependencies
COPY package.json /routing-rules-service/
RUN cd /routing-rules-service

RUN npm install

EXPOSE 8080

CMD npm run prod
