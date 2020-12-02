FROM gcr.io/google-appengine/nodejs:latest

RUN mkdir -p /authentication-bff

ADD . /authentication-bff/
WORKDIR /authentication-bff/

# Install app dependencies
COPY package.json /authentication-bff/
RUN cd /authentication-bff

RUN npm install

EXPOSE 8080

CMD npm run prod
