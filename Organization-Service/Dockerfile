FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /organization-service

ADD . /organization-service/
WORKDIR /organization-service/

# Install app dependencies
COPY package.json /organization-service/
RUN cd /organization-service

RUN npm install

EXPOSE 8080

CMD npm run prod
