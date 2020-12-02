# MasterData Backend-for-Frontend (BFF)

## Overview

### Purpose:

The MasterData BFF provides externally-exposed, permissioned APIs
for working with EPCIS master data

### Implementation:

The BFF is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Provide secure, OAUTH2-authenticated APIs
- Accept GS1-compliant EPCIS XML payloads
- Determine API caller (tenant_id in the JWT)
- Call downstream microservices, passing tenant_id as needed

### Flows

The following sequence diagram illustrates a typical BFF API call.

![alt text](Masterdata%20BFF%20Flow.png)

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

- MASTERDATA_SERVICE - the internal masterdata service URL
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

- MSDX1000 (Error getting client id from request token. %s)
- MSDX4000 (Couldn't post new alert to alert-service.)
- MSDX4001 (Error returned when posting masterdata to masterdata-service for client id %s. %s)
- MSDX4002 (Error posting masterdata to masterdata-service for client id %s. %s)
- MSDX4003 (Error returned when getting masterdata from masterdata-service for masterdata id %s. %s)
- MSDX4004 (Error getting masterdata from masterdata-service for masterdata id %s. %s)
- MSDX4005 (Error returned when getting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX4006 (Error getting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX4007 (Error returned when deleting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX4008 (Error deleting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX4009 (Error returned when getting all masterdata status from masterdata-service for client id %s. %s)
- MSDX4010 (Error getting all masterdata status from masterdata-service for client id %s. %s)
- MSDX9000 (Unknown error posting masterdata to masterdata-service for client id %s. %s)
- MSDX9001 (Unknown error getting masterdata from masterdata-service for masterdata id %s. %s)
- MSDX9002 (Unknown error getting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX9002 (Unknown error deleting masterdata status from masterdata-service for masterdata id %s. %s)
- MSDX9003 (Unknown error getting all masterdata status from masterdata-service for client id %s. %s)
