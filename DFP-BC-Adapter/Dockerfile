FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /bc-adapter

ADD . /bc-adapter/
WORKDIR /bc-adapter/

# Install app dependencies
COPY package.json /bc-adapter/
RUN cd /bc-adapter

RUN npm install

EXPOSE 8080

CMD npm run prod
