FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /masterdata-processor

ADD . /masterdata-processor/
WORKDIR /masterdata-processor/

# Install app dependencies
COPY package.json /masterdata-processor/
RUN cd /masterdata-processor

RUN npm install

EXPOSE 8080

CMD npm run prod
