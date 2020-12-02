FROM gcr.io/google-appengine/nodejs:latest

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME


RUN mkdir -p /query-service

ADD . /query-service/
WORKDIR /query-service/

# Install app dependencies
COPY package.json /query-service/
RUN cd /query-service

RUN npm install

EXPOSE 8080

CMD npm run prod
