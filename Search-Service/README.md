# Search Microservice

## Overview

### Purpose:

The search microservice provides an internally-accessible API for searching the events in Elasticsearch.

### Implementation:

The microservice is implemented using Node.js, Express, TypeScript, and Elasticsearch.

### Primary functions:

- Searches for events in Elasticsearch
- Adds new events to Elasticsearch
- Updates events in Elasticsearch
- Deletes events in Elasticsearch

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

- ESCOMPOSED The composed URL for Elasticsearch
- ESCERT The Base64-encoded certificate for accessing Elasticsearch
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

### ERRORS

- SERS4000 (Couldn't post new alert to alert-service.)
- SERS4001 (Couldn't create Elasticsearch index)
- SERS4002 (Couldn't index new event data in Elasticsearch)
- SERS4003 (Couldn't refresh index in Elasticsearch)
- SERS4004 (Couldn't update event data in Elasticsearch)
- SERS4005 (Couldn't delete event data in Elasticsearch)
- SERS4006 (Couldn't query event data in Elasticsearch)
- SERS4007 (Couldn't delete Elasticsearch index)
- SERS4008 (Couldn't retrieve event data by ID from Elasticsearch)
- SERS4009 (Couldn't update event data in Elasticsearch)
- SERS4010 (Couldn't delete event data in Elasticsearch)

- SERS9000 (Unknown error while adding new event data to Elasticsearch index)
- SERS9001 (Unknown error while retrieving event data by ID from Elasticsearch)
- SERS9002 (Unknown error while updating event data in Elasticsearch)
- SERS9003 (Unknown error while deleting event data in Elasticsearch)
- SERS9004 (Unknown error while deleting Elasticsearch index)
