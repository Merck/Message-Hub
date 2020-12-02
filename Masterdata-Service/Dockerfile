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


RUN mkdir -p /masterdata-service

ADD . /masterdata-service/
WORKDIR /masterdata-service/

# Install app dependencies
COPY package.json /masterdata-service/
RUN cd /masterdata-service

RUN npm install

EXPOSE 8080

CMD npm run prod
