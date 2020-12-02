# Query Microservice

## Overview

### Purpose:

The query microservice provides an internally-accessible API for accepting
GS1-compliant EPCIS query payloads, verifying them, and execute queries.

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Accept GS1-compliant EPCIS XML payloads
- Verify XML as complete and valid
- Convert XML to JSON
- Query Elasticsearch and events DB to find matches
- Response with GS1- compliant EPCIS Query Results or appropriate error messages and HTTP status
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

## Swagger API documentation

Swagger API endpoint is host:port/api.

## Error Codes

### WARNINGS

- QRYS1000 (Invalid XML.)
- QRYS1001 (XML doesn't comply with EPCIS standard.)
- QRYS1002 (XML doesn't contain Query name.)
- QRYS1003 (XML doesn't contain Query params.)
- QRYS1004 (XML doesn't contain required/supported Query params to search for Event XML.)
- QRYS1005 (The query param %s is not searchable for Event XML.)
- QRYS1006 (The value of query param %s is not present to search for Event XML.)

### ERRORS

- QRYS4000 (Couldn't post new alert to alert-service.)
- QRYS4001 (Error when searching the event from the search service for the organization id %s.)
- QRYS4002 (Unable to get the event xmls from the event service for the organization %s.)
- QRYS4003 (Error returned while preparing the EPCIS Query Results XML for the organization %s.)
- QRYS4004 (Couldn't get organization from organization-service.)
- QRYS4005 (No Event XMLs found from the event service for matching event ids matched for the organization %s.)
- QRYS9000 (Unknown error when processing new query.)
