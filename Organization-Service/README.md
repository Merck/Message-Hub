# Organization Microservice

## Overview

### Purpose:

The organization microservice provides an internally-accessible API for performing
organization-related functions

### Implementation:

The microservice is implemented using Node.js, Express, and TypeScript.

### Primary functions:

- Lookup organization for a given username
- Lookup organization for a given client credential
- Onboard new organizations
- Onboard new organization users
- Onboard new organization clients

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

- ORGS4000 (Couldn't retrieve organization for username %s in the database)
- ORGS4001 (Couldn't retrieve organization for subject id %s in the database)
- ORGS4002 (Couldn't retrieve organization for client id %s in the database)
- ORGS4003 (Couldn't retrieve organization data for org id %s from the database)
- ORGS4004 (Couldn't create new organization with name %s in the database)
- ORGS4005 (Couldn't update organization with org id %s in the database)
- ORGS4006 (Couldn't retrieve organization users with org id %s from the database)
- ORGS4007 (Couldn't retrieve organization user with org id %s and subject id %s from the database)
- ORGS4008 (Couldn't create new organization user with org id %s and subject id %s in the database)
- ORGS4009 (Couldn't update organization user with org id %s and subject id %s in the database)
- ORGS4010 (Couldn't delete organization user with org id %s and subject id %s from the database)
- ORGS4011 (Couldn't retrieve organization clients with org id %s from the database)
- ORGS4012 (Couldn't retrieve organization client with org id %s and client id %s from the database)
- ORGS4013 (Couldn't create new organization client with org id %s and client id %s in the database)
- ORGS4014 (Couldn't update organization client with org id %s and client id %s in the database)
- ORGS4015 (Couldn't delete organization client with org id %s and client id %s from the database)
- ORGS4016 (Couldn't post new alert to alert-service.)

- ORGS9000 (Unknown error finding organization for user in the database)
- ORGS9001 (Unknown error retrieving organization data for org id %s from the database)
- ORGS9002 (Unknown error creating new organization in the database)
- ORGS9003 (Unknown error updating organization with org id %s in the database)
- ORGS9004 (Unknown error getting organization users with org id %s from the database)
- ORGS9005 (Unknown error retrieving organization user with org id %s and subject id %s from the database)
- ORGS9006 (Unknown error creating new organization user with org id %s and subject id %s in the database)
- ORGS9007 (Unknown error updating organization user with org id %s and subject id %s in the database)
- ORGS9008 (Unknown error deleting organization user with org id %s and subject id %s from the database)
- ORGS9009 (Unknown error retrieving organization clients with org id %s from the database)
- ORGS9010 (Unknown error retrieving organization client with org id %s and client id %s from the database)
- ORGS9011 (Unknown error creating new organization client with org id %s and client id %s in the database)
- ORGS9012 (Unknown error updating organization client with org id %s and client id %s in the database)
- ORGS9013 (Unknown error deleting organization client with org id %s and client id %s from the database)
