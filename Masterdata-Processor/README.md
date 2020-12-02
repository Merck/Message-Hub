# Masterdata Processor

## Overview

### Purpose:

The Masterdata Processor provides asynchronous processing by
listening for master data on the processing queue.

### Implementation:

The Processor is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Listens to the masterdata processing queue to fetch the masterdata metadata
- Determines the destination to which the masterdata data to be routed from routing rules
- Sends the masterdata metadata to required destination to process
- Update the masterdata status in database when fails to determine routing rules or when failed during processing to destination
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

- to come

### Rolling back a release

Instructions on how to rollback a release can be found in ...

### Starting/Stopping the Service

All services are deployed as Kubernetes-managed pods on the IBM Cloud. Please refer to the official
[Kubernetes documentation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for common commands.

## Monitoring

Health check endpoint is host:port/oauth/health.

## Error Codes

### WARNINGS

- MSDP1001 (Received a message in processing queue without a content type. Assuming it is application/json.)
- MSDP1002 (Received a message in processing queue without a content encoding. Assuming it is UTF-8.)
- MSDP2010 (Reconnecting to Rabbit MQ.)
- MSDP2011 (Reconnecting to Postgres Database.)

### ERRORS

- MSDP1003 (Received a message in processing queue without a masterdata id)
- MSDP1004 (Received a message in processing queue without a client id)
- MSDP1005 (Received a message in processing queue without a organization id from client id %s)
- MSDP1006 (Received a message in processing queue without any content from client id %s)
- MSDP1007 (Received a message in processing queue with empty content from client id %s)
- MSDP2000 (Unable to determine a route for masterdata with ID %s based on current routing rules)
- MSDP4000 (Couldn't post new alert to alert-service.)
- MSDP4001 (Error retrieving the routing rules for organization from routing rules service for masterdata with ID %s. %s)
- MSDP4002 (Failed to process masterdata with id %s to the required destination Blockchain adapter: %s)
- MSDP4003 (Unable to update masterdata with id %s to failed status in database)
- MSDP4004 (Unable to update masterdata destination with id %s to failed status in database)
- MSDP4005 (Couldn't connect to RabbitMQ.)
- MSDP4006 (Couldn't create RabbitMQ channel.)
- MSDP4007 (RabbitMQ deadletter queue error.)
- MSDP4008 (Unknown RabbitMQ queue error.)
- MSDP4009 (Error in connecting to Postgres database.)
- MSDP4010 (Unable to get the display name of the adapter service name %s from the database for masterdata id %s)
- MSDP9000 (An unknown error occurred while determining a route for masterdata with ID %s. %s)
