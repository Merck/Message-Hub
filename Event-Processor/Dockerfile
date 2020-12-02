FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /event-processor

ADD . /event-processor/
WORKDIR /event-processor/

# Install app dependencies
COPY package.json /event-processor/
RUN cd /event-processor

RUN npm install

EXPOSE 8080

CMD npm run prod
