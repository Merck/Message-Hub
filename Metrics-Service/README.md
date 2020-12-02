# Metrics Microservice

## Overview

### Purpose:

The metrics microservice provides an internally-accessible API for producing metrics on hub usage

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Gets the total Hub messages processed.
- Gets the event messages processed by period, type, source, destination and status

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

### Rolling back a release

Instructions on how to rollback a release can be found in ...

### Starting/Stopping the Service

All services are deployed as Kubernetes-managed pods on the IBM Cloud. Please refer to the official
[Kubernetes documentation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for common commands.

## Monitoring

Health check endpoint is host:port/oauth/health.

## Error Codes

### WARNINGS

- METS1001 (Provide duration as either past week or past day or past hour to fetch events by period.)

### ERRORS

- METS4000 (Couldn't post new alert to alert-service.)
- METS4001 (Couldn't retrieve metrics details from database.)
