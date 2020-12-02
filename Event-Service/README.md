# Event Microservice

## Overview

### Purpose:

The event microservice provides an internally-accessible API for accepting
GS1-compliant EPCIS event payloads, verifying them, recording their status
in the Postgres database, and placing them into the Event Process Queue to
be processed.

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Accept GS1-compliant EPCIS XML payloads
- Verify XML as complete and valid
- Convert XML to JSON
- Store Event Metadata in Postgres and Elasticsearch
- Write Event JSON to Rabbit MQ
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
- RABBITMQ_EVENT_EXCHANGE - the Event Queue Exchange name
- RABBITMQ_EVENT_QUEUE - the Event Queue name
- RABBITMQ_EVENT_HOLDING_EXCHANGE - the Event Queue Exchange name when holding processing
- RABBITMQ_EVENT_HOLDING_QUEUE - the Event Queue name when holding processing
- RABBITMQ_EVENT_DEADLETTER_EXCHANGE - the Event Deadletter Queue Exchange name
- RABBITMQ_EVENT_DEADLETTER_QUEUE - the Event Deadletter Queue name
- EVENT_BFF - the Event BFF callback URL for event status
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

## Swagger API documentation

Swagger API endpoint is host:port/api.

## Error Codes

### WARNINGS

- EVTS1000 (Invalid XML.)
- EVTS1001 (XML doesn't comply with EPCIS standard.)
- EVTS1002 (Wrong number of events in XML payload. Expected 1.)
- EVTS1003 (Aggregation events are not supported.)
- EVTS2010 (Reconnecting to Rabbit MQ.)
- EVTS2011 (Reconnecting to Postgres Database.)

### ERRORS

- EVTS4000 (Couldn't post new alert to alert-service.)
- EVTS4001 (Couldn't post new event to search-service.)
- EVTS4002 (Couldn't get organization from organization-service.)
- EVTS4003 (Couldn't retrieve event details from database)
- EVTS4004 (Couldn't retrieve event status from database)
- EVTS4005 (Couldn't retrieve unique event sources from database)
- EVTS4006 (Couldn't retrieve unique event destinations from database")
- EVTS4007 (Couldn't get data privacy rules from data-privacy-rules-service.)
- EVTS4008 (Couldn't connect to RabbitMQ.)
- EVTS4009 (Couldn't create or confirm RabbitMQ channel.),
- EVTS4010 (RabbitMQ channel error.),
- EVTS4011 (RabbitMQ channel closed unexpectedly.)
- EVTS4012 (Couldn't publish event to RabbitMQ channel.)
- EVTS4013 (Unknown error publishing event to RabbitMQ channel.)
- EVTS4014 (Unknown error when processing event queue count on RabbitMQ channel.)
- EVTS4015 (Unknown error when processing event deadletter queue count on RabbitMQ channel.)
- EVTS4016 (Error in connecting to Postgres database.)
- EVTS4017 (Couldn't set the event processing queue status to database.)
- EVTS4018 (Unknown RabbitMQ queue error.)
- EVTS4019 (Couldn't get the processing queue status to database.)
- EVTS4020 (Unable to update event with id %s to processing status in database.)
- EVTS4021 (Unable to update event with id %s to processing status in search service.)
- EVTS9000 (Unknown error when processing new event)
