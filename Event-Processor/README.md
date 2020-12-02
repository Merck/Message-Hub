# Event Processor

## Overview

### Purpose:

The Event Processor provides asynchronous event processing by
listening for events on the processing queue.

### Implementation:

The Processor is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Listens to the event processing queue to fetch the event metadata
- Determines the destination to which the event data to be routed from routing rules
- Sends the event metadata to required destination to process
- Update the event status in database and elastic search when fails to determine routing rules or when failed during processing to destination
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
- RABBITMQ_EVENT_DEADLETTER_EXCHANGE - the Event Dead Letter Queue Exchange name
- RABBITMQ_EVENT_DEADLETTER_QUEUE - the Dead Letter Queue name
- ROUTING_RULES_SERVICE - the internal routing rule service URL
- ORGANIZATION_SERVICE - the internal organization service URL
- SEARCH_SERVICE - the internal search service URL
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

- EVTP1001 (Received a message in processing queue without a content type. Assuming it is application/json")
- EVTP1002 (Received a message in processing queue without a content encoding. Assuming it is UTF-8")
- EVTP2010 (Reconnecting to Rabbit MQ.)
- EVTP2011 (Reconnecting to Postgres Database.)

### ERRORS

- EVTP1003 (Received a message in processing queue without an event id)
- EVTP1004 (Received a message in processing queue without a client id)
- EVTP1005 (Received a message in processing queue without a organization id from client id %s)
- EVTP1006 (Received a message in processing queue without any content from client id %s)
- EVTP1007 (Received a message in processing queue with empty content from client id %s)

- EVTP2000 (Unable to determine a route for event with ID %s based on current routing rules)

- EVTP4000 (Couldn't post new alert to alert-service.)
- EVTP4001 (Error retrieving the routing rules for organization from routing rules service for event with ID %s. %s)
- EVTP4002 (Failed to process event with id %s to the required destination Blockchain adapter: %s)
- EVTP4003 (Unable to update event with id %s to failed status in search service)
- EVTP4004 (Unable to update event with id %s to failed status in database)
- EVTP4005 (Unable to update event destination with id %s to failed status in database)
- EVTP4006 (Couldn't connect to RabbitMQ.)
- EVTP4007 (Couldn't create RabbitMQ channel.)
- EVTP4008 (RabbitMQ deadletter queue error.)
- EVTP4009 (Unknown RabbitMQ queue error.)
- EVTP4010 (Error in connecting to Postgres database.)
- EVTP4011 (Unable to get the display name of the adapter service name %s from the database for event id %s)
- EVTP9000 (An unknown error occurred while determining a route for event with ID %s. %s")
