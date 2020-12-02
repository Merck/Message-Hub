FROM gcr.io/google-appengine/nodejs:latest
RUN mkdir -p /admin-bff

ADD . /admin-bff/
WORKDIR /admin-bff/

# Install app dependencies
COPY package.json /admin-bff/
RUN cd /admin-bff

RUN npm install

EXPOSE 8080

CMD npm run prod
