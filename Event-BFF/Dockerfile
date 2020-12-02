FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /event-bff

ADD . /event-bff/
WORKDIR /event-bff/

# Install app dependencies
COPY package.json /event-bff/
RUN cd /event-bff

RUN npm install

EXPOSE 8080

CMD npm run prod
