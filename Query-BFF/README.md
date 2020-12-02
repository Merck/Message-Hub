# Query Backend-for-Frontend (BFF)

## Overview

### Purpose:

The Query BFF provides externally-exposed, permissioned APIs
for working with EPCIS queries

### Implementation:

The BFF is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Provide secure, OAUTH2-authenticated APIs
- Accept GS1-compliant EPCIS XML payloads
- Determine API caller (client_id in the JWT)
- Call downstream microservices, passing client_id as needed

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

- QUERY_SERVICE - the internal query service URL
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

- QRYX1000 (Error getting client id from request token. %s")
- QRYX4000 (Couldn't post new alert to alert-service.")
- QRYX4001 (Error returned when posting query to query-service for client id %s. %s")
- QRYX4002 (Error posting query to query-service for client id %s. %s")
- QRYX9000 (Unknown error posting query to query-service for client id %s. %s")
