# Routing Rules Microservice

## Overview

### Purpose:

The routing rules microservice provides an internally-accessible API for performing
routing rules management functions

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Gets all the routing rules for an organization
- Creates new rules
- Edits existing rules
- Deletes rules

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
- ORGANIZATION_SERVICE - the cluster-internal url to the organization microservice

### Rolling back a release

Instructions on how to rollback a release can be found in ...

### Starting/Stopping the Service

All services are deployed as Kubernetes-managed pods on the IBM Cloud. Please refer to the official
[Kubernetes documentation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for common commands.

## Monitoring

Health check endpoint is host:port/oauth/health.

## Error Codes

### ERRORS

- RTRS4000 (Couldn't post new alert to alert-service.)
- RTRS4001 (Couldn't retrieve the list of configured data fields from database.)
- RTRS4002 (Couldn't retrieve the list of configured comparators from database.)
- RTRS4003 (Couldn't retrieve the list of configured adapters from database.)
- RTRS4004 (Couldn't retrieve routing rules from database.)
- RTRS4005 (Couldn't create the routing rule in database.)
- RTRS4006 (Couldn't retrieve routing rule from database.)
- RTRS4007 (Couldn't update the routing rule in database.)
- RTRS4008 (Couldn't update the ordering the list of routing rules in database.)
- RTRS4009 (Couldn't delete the routing rule from database.)
- RTRS4010 (Couldn't retrieve the audit history of routing rules from database.)
- RTRS9001 (Unknown error while retrieving the list of configured data fields from database.)
- RTRS9002 (Unknown error while retrieving the list of configured comparators from database.)
- RTRS9003 (Unknown error while retrieving the list of configured adapters from database.)
- RTRS9004 (Unknown error while retrieving routing rules from database.)
- RTRS9005 (Unknown error while creating the routing rule in database.)
- RTRS9006 (Unknown error while retrieving routing rule from database.)
- RTRS9007 (Unknown error while updating the routing rule in database.)
- RTRS9008 (Unknown error while deleting the routing rule from database.)
- RTRS9009 (Unknown error while retrieving the audit history of routing rules from database.)
