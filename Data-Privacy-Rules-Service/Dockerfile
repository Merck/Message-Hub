FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /data-privacy-rules-service

ADD . /data-privacy-rules-service/
WORKDIR /data-privacy-rules-service/

# Install app dependencies
COPY package.json /data-privacy-rules-service/
RUN cd /data-privacy-rules-service

RUN npm install

EXPOSE 8080

CMD npm run prod
