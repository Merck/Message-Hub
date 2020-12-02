# Digital Fingerprinting Blockchain Adapter

## Overview

### Purpose:

Demonstrates how to write a Blockchain adapter.

### Implementation:

The adapter is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Writes properly-constructed commissioning events to the DFP blockchain.
- Rejects other events and masterdata

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
- SEARCH_SERVICE - the internal search service URL
- ALERT_SERVICE - the internal alert service URL
- CREDENTIALS_PW_ENC_KEY - the key used to encrypt/decrypt the passwords in the organization_credentials table
- DFP_BLOCKCHAIN_API - the host uri for the blockchain API

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

- DFBC1000 (Error processing event %s. Reason: %s)
- DFBC2000 (Couldn't find organization's credentials for connecting to the DFP blockchain API in organization_credentials table)
- DFBC2001 (Couldn't decrypt configured password from organization_credentials table.)
- DFBC3000 (Error writing event %s to blockchain. Reason: %s )
- DFBC3001 (Error writing event %s to blockchain. Unable to authenticate to blockchain using credentials in organization_credentials table.)
- DFBC9000 (Unknown error when processing event data)
