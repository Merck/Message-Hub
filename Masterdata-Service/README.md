# Master Data Microservice

## Overview

### Purpose:

The masterdata microservice provides an internally-accessible API for accepting
GS1-compliant EPCIS master data payloads, verifying them, recording their status
in the Postgres database, and placing them into the Master Data Process Queue to
be processed.

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Accept GS1-compliant EPCIS Masterdata XML payloads
- Verify XML as complete and valid
- Convert XML to JSON
- Store masterdata Metadata in Postgres
- Write masterdata JSON to Rabbit MQ
- Provide callback URL to check status
- Response with OK or appropriate error messages and HTTP status
- Log any errors to log files

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Build

Run `npm install` to install all of the node dependencies.

### Development server

Run `npm run dev` to buid and run the service in development mode.

### Production server

Run `npm run prod` to build and run the service in production mode.

### Running unit tests

This project uses Jest for unit testing

To run the unit tests, run `npm run test`

To automatically run and monitor tests while coding, run `npm run test:watch`

### Viewing coverage

Running the above tests will create a coverage report in the [/coverage/lcov-report](./coverage/lcov-report/index.html)
directory. You can easily view this report by running `npm run view:coverage`

### Further help

## Deployment

This project is fully integrated in the CI/CD pipeline. To deploy this code, create a merge
request in the Git repository and merge that into the develop branch.

Deployment is performed by the pipeline using Helm charts which spin up the necessary number of pods on a Kubernetes environment.

### Environment setup

This project require the following environment variables to be properly configured:

- PGUSER - the Postgres user name
- PGPASSWORD - the Postgres user password
- PGHOST - the Postgres host url
- PGPORT - the Postgres port number
- PGDATABASE - the Postgres database name
- PGCERT - the Base64-encoded certificate for accessing cloud services
- RABBITMQ_PROTOCOL - the protocol for RabbitMQ
- RABBITMQ_HOST - the RabbitMQ host
- RABBITMQ_PORT - the RabbitMQ port number
- RABBITMQ_USER - the RabbitMQ username
- RABBITMQ_PASSWORD - the RabbitMQ password
- RABBITMQ_CERT - the Base64-encoded RabbitMQ certificate for connecting to cloud services
- RABBITMQ_MASTERDATA_EXCHANGE - the Masterdata Queue Exchange name
- RABBITMQ_MASTERDATA_QUEUE - the Masterdata Queue name
- RABBITMQ_MASTERDATA_HOLDING_EXCHANGE - the Masterdata Queue Exchange name when holding processing
- RABBITMQ_MASTERDATA_HOLDING_QUEUE - the Masterdata Queue name when holding processing
- RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE - the Masterdata Deadletter Queue Exchange name
- RABBITMQ_MASTERDATA_DEADLETTER_QUEUE - the Masterdata Deadletter Queue name
- MASTERDATA_BFF - the masterdata BFF callback URL for masterdata status
- ORGANIZATION_SERVICE - the internal organization service URL
- SEARCH_SERVICE - the internal search service URL
- DATA_PRIVACY_RULES_SERVICE - the internal data privacy rule service URL
- ALERT_SERVICE - the internal alert service URL

### Rolling back a release

Instructions on how to rollback a release can be found in ...

### Starting/Stopping the Service

All services are deployed as Kubernetes-managed pods on the IBM Cloud. Please refer to the official
[Kubernetes documentation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for common commands.

## Monitoring

Health check endpoint is host:port/oauth/health.

## Error Codes

### WARNINGS

- MSDS1000 (Invalid XML.)
- MSDS1001 (XML doesn't comply with EPCIS standard.)
- MSDS2010 (Reconnecting to Rabbit MQ.)
- MSDS2011 (Reconnecting to Postgres Database.)

### ERRORS

- MSDS4000 (Couldn't post new alert to alert-service.)
- MSDS4001 (Couldn't delete masterdata from database.)
- MSDS4002 (Couldn't get organization from organization-service.)
- MSDS4003 (Couldn't retrieve masterdata details from database)
- MSDS4004 (Couldn't retrieve masterdata status from database)
- MSDS4005 (Couldn't retrieve unique masterdata sources from database)
- MSDS4006 (Couldn't retrieve unique masterdata destinations from database")
- MSDS4007 (Couldn't get data privacy rules from data-privacy-rules-service.)
- MSDS4008 (Couldn't connect to RabbitMQ.)
- MSDS4009 (Couldn't create or confirm RabbitMQ channel.),
- MSDS4010 (RabbitMQ channel error.),
- MSDS4011 (RabbitMQ channel closed unexpectedly.)
- MSDS4012 (Couldn't publish masterdata to RabbitMQ channel.)
- MSDS4013 (Unknown error publishing masterdata to RabbitMQ channel.)
- MSDS4014 (Unknown error when processing masterdata queue count on RabbitMQ channel.)
- MSDS4015 (Unknown error when processing masterdata deadletter queue count on RabbitMQ channel.)
- MSDS4016 (Unknown RabbitMQ queue error.)
- MSDS4017 (Error in connecting to Postgres database.)
- MSDS4018 (Couldn't set the masterdata processing queue status to database.)
- MSDS4019 (Unable to update masterdata with id %s to processing status in database.)
- MSDS9000 (Unknown error when processing new masterdata)
