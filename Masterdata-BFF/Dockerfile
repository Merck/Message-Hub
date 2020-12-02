FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /masterdata-bff

ADD . /masterdata-bff/
WORKDIR /masterdata-bff/

# Install app dependencies
COPY package.json /masterdata-bff/
RUN cd /masterdata-bff

RUN npm install

EXPOSE 8080

CMD npm run prod
