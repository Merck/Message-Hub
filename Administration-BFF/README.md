# Administration Backend-for-Frontend (BFF)

## Overview

### Purpose:

The Administration BFF provides externally-exposed, permissioned APIs for performing Hub administration
functions. This BFF is crafted for use by the Messaging Hub UI.

### Implementation:

The BFF is implemented using Node.js, Express, and TypeScript. The backend functions are not performed by the
BFF, but by individual microservices that the BFF calls.

### Primary functions:

The Administration BFF provides APIs that allow users to perform functions within the Messaging
Hub UI, such as view Hub status, search for events, manage master data and various rules.

### Flows

The following sequence diagram illustrates a typical BFF API call.

![alt text](Administration%20BFF%20Flow.png)

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

- OAUTH_SERVER - the URL to the OAUTH authentication server, for example: '`https://us-south.appid.cloud.ibm.com/oauth/v4/...`'
- USERINFO_ENDPOINT - the OAUTH authentication server's user info endpoint, for example: '`/userinfo`',
- APIKEY - the App ID API access key
- MANAGEMENT_SERVER - the App ID/Cloud Directory user management API URL
- IAM_SERVER - the IAM API URL
- IAM_TOKEN_ENDPOINT - the IAM endpoint for requesting an IAM access token
- ORGANIZATION_SERVICE - the cluster-internal URL to the organization microservice
- EVENT_SERVICE - the cluster-internal URL to the event microservice
- SEARCH_SERVICE - the cluster-internal URL to the search microservice
- ROUTING_RULES_SERVICE - the cluster-internal URL to the routing rules microservice
- DATA_PRIVACY_RULES_SERVICE - the cluster-internal URL to the data privacy rules microservice
- MASTERDATA_SERVICE - the cluster-internal URL to the masterdata microservice
- METRICS_SERVICE - the cluster-internal URL to the metrics microservice
- ALERT_SERVICE - the cluster-internal URL to the alert microservice

### Rolling back a release

Instructions on how to rollback a release can be found in ...

### Starting/Stopping the Service

All services are deployed as Kubernetes-managed pods on the IBM Cloud. Please refer to the official
[Kubernetes documentation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for common commands.

## Monitoring

Health check endpoint is host:port/admin/health.

## Error Codes

### ERRORS

- ADMX1000 (Error getting organization id from request token.)
- ADMX4000 (Couldn't post new alert to alert-service.)
- ADMX4001 (Error returned when fetching all alerts from the database for the organization id %s. %s)
- ADMX4002 (Error when fetching all alerts from the database for the organization id %s. %s)
- ADMX4003 (Error returned when fetching the alert %s from the database for the organization id %s. %s)
- ADMX4004 (Error when fetching the alert %s from the database for the organization id %s. %s)
- ADMX4005 (Error returned when fetching alerts count from the database for the organization id %s. %s)
- ADMX4006 (Error when fetching alerts count from the database for the organization id %s. %s)
- ADMX4007 (Error returned when clearing all from the database for the organization id %s. %s)
- ADMX4008 (Error when clearing all from the database for the organization id %s. %s)
- ADMX4009 (Error returned when clearing the alert %s from the database for the organization id %s. %s)
- ADMX4010 (Error when clearing the alert %s from the database for the organization id %s. %s)
- ADMX4011 (Error returned when searching the event from the search service for the organization id %s. %s)
- ADMX4012 (Error when searching the event from the search service for the organization id %s. %s)
- ADMX4013 (Error returned when fetching the event %s from the database for the organization id %s. %s)
- ADMX4014 (Error when fetching the event %s from the database for the organization id %s. %s)
- ADMX4015 (Error returned when fetching distinct event sources from the database for the organization id %s. %s)
- ADMX4016 (Error when fetching distinct event sources from the database for the organization id %s. %s)
- ADMX4017 (Error returned when fetching distinct event destinations from the database for the organization id %s. %s)
- ADMX4018 (Error when fetching distinct event destinations from the database for the organization id %s. %s)
- ADMX4019 (Error returned when fetching count of messages in processing queues from the event and masterdata services for the organization id %s. %s)
- ADMX4020 (Error when fetching count of messages in processing queues from the event and masterdata services for the organization id %s. %s)
- ADMX4021 (Error returned when fetching count of failed messages in deadletter queue from the event service for the organization id %s. %s)
- ADMX4022 (Error when fetching count of failed messages in deadletter queues from the event service for the organization id %s. %s)
- ADMX4023 (Error returned when retrying failed messages in deadletter queue from the event service for the organization id %s. %s)
- ADMX4024 (Error when retrying failed messages in deadletter queues from the event service for the organization id %s. %s)
- ADMX4025 (Error returned when setting the event queue status to pause/resume of processing queue from the event service for the organization id %s. %s)
- ADMX4026 (Error when setting the event queue status to pause/resume of processing queue from the event service for the organization id %s. %s)
- ADMX4027 (Error returned when fetching the event processing queue status from the event service for the organization id %s. %s)
- ADMX4028 (Error when fetching the event processing queue status from the event service for the organization id %s. %s)
- ADMX4029 (Error returned when fetching the organization of user from organization service. %s)
- ADMX4030 (Error when fetching the organization of user from organization service. %s)
- ADMX4031 (Error returned when updating the organization from organization service for the organization id %s. %s)
- ADMX4032 (Error when updating the organization from organization service for the organization id %s. %s)
- ADMX4033 (Error when fetching the organization details from organization service based on user's subject id. %s)
- ADMX4034 (Error returned when fetching the organization id from organization service. %s)
- ADMX4035 (Error when fetching the organization id from organization service. %s)
- ADMX4036 (Error returned when fetching the list of organization users from organization service for organization id %s. %s)
- ADMX4037 (Error when fetching the list of organization users from organization service for organization id %s. %s)
- ADMX4038 (Error returned when creating a new organization user from organization service for organization id %s. %s)
- ADMX4039 (Error when creating a new organization user from organization service for organization id %s. %s)
- ADMX4040 (Error returned when fetching user details of %s from organization service for organization id %s. %s)
- ADMX4041 (Error when fetching user details of %s from organization service for organization id %s. %s)
- ADMX4042 (Error returned when updating the user details of %s from organization service for organization id %s. %s)
- ADMX4043 (Error when deleting the user %s from organization service for organization id %s. %s)
- ADMX4044 (Error returned when deleting the user %s from organization service for organization id %s. %s)
- ADMX4045 (Error when updating the user details of %s from organization service for organization id %s. %s)
- ADMX4046 (Error returned when fetching all master data from database for organization id %s. %s)
- ADMX4047 (Error when fetching all master data from database for organization id %s. %s)
- ADMX4048 (Error returned when fetching the master data %s from database for organization id %s. %s)
- ADMX4049 (Error when fetching the master data %s from database for organization id %s. %s)
- ADMX4050 (Error returned when retrying the failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX4051 (Error when retrying the failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX4052 (Error returned when fetching the count of failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX4053 (Error when fetching the count of failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX4054 (Error returned when deleting the masterdata %s from database for organization id %s. %s)
- ADMX4055 (Error when deleting the masterdata %s from database for organization id %s. %s)
- ADMX4056 (Error returned when setting the masterdata queue status to pause/resume of processing queue from the masterdata service for the organization id %s. %s)
- ADMX4057 (Error when setting the masterdata queue status to pause/resume of processing queue from the masterdata service for the organization id %s. %s)
- ADMX4058 (Error returned when fetching the count of messages processed from database for the organization id %s. %s)
- ADMX4059 (Error when fetching the count of messages processed from database for the organization id %s. %s)
- ADMX4060 (Error returned when fetching the event messages processed for a given period from database for the organization id %s. %s)
- ADMX4061 (Error when fetching the event messages processed for a given period from database for the organization id %s. %s)
- ADMX4062 (Error returned when fetching the event messages processed by type from database for the organization id %s. %s)
- ADMX4063 (Error when fetching the event messages processed by type from database for the organization id %s. %s)
- ADMX4064 (Error returned when fetching the event messages processed by source from database for the organization id %s. %s)
- ADMX4065 (Error when fetching the event messages processed by source from database for the organization id %s. %s)
- ADMX4066 (Error returned when fetching the event messages processed by destination from database for the organization id %s. %s)
- ADMX4067 (Error when fetching the event messages processed by destination from database for the organization id %s. %s)
- ADMX4068 (Error returned when fetching the event messages processed by status from database for the organization id %s. %s)
- ADMX4069 (Error when fetching the event messages processed by status from database for the organization id %s. %s)
- ADMX4070 (Error returned when fetching the list of configured data fields for data privacy rules from database for the organization id %s. %s)
- ADMX4071 (Error when fetching the list of configured data fields for data privacy rules from database for the organization id %s. %s)
- ADMX4072 (Error returned when fetching the data privacy rules from database for the organization id %s. %s)
- ADMX4073 (Error when fetching the data privacy rules from database for the organization id %s. %s)
- ADMX4074 (Error returned when creating the data privacy rule in database for the organization id %s. %s)
- ADMX4075 (Error when creating the data privacy rule in database for the organization id %s. %s)
- ADMX4076 (Error returned when fetching the data privacy rule %s from database for the organization id %s. %s)
- ADMX4077 (Error when fetching the data privacy rule %s from database for the organization id %s. %s)
- ADMX4078 (Error returned when updating the data privacy rule %s in database for the organization id %s. %s)
- ADMX4079 (Error when updating the data privacy rule %s in database for the organization id %s. %s)
- ADMX4080 (Error returned when reordering the data privacy rules in database for the organization id %s. %s)
- ADMX4081 (Error when reordering the data privacy rules in database for the organization id %s. %s)
- ADMX4082 (Error returned when deleting the data privacy rule %s from database for the organization id %s. %s)
- ADMX4083 (Error when deleting the data privacy rule %s from database for the organization id %s. %s)
- ADMX4084 (Error returned when fetching the audit history of data privacy rules from database for the organization id %s. %s)
- ADMX4085 (Error when fetching the audit history of data privacy rules from database for the organization id %s. %s)
- ADMX4086 (Error returned when fetching the list of configured data fields for routing rules from database. %s)
- ADMX4087 (Error when fetching the list of configured data fields for routing rules from database. %s)
- ADMX4088 (Error returned when fetching the list of configured comparators for routing rules from database. %s)
- ADMX4089 (Error when fetching the list of configured comparators for routing rules from database. %s)
- ADMX4090 (Error returned when fetching the list of configured destinations for routing rules from database. %s)
- ADMX4091 (Error when fetching the list of configured destinations for routing rules from database. %s)
- ADMX4092 (Error returned when fetching the routing rules from database for the organization id %s. %s)
- ADMX4093 (Error when fetching the routing rules from database for the organization id %s. %s)
- ADMX4094 (Error returned when creating the routing rule in database for the organization id %s. %s)
- ADMX4095 (Error when creating the routing rule in database for the organization id %s. %s)
- ADMX4096 (Error returned when fetching the routing rule %s from database for the organization id %s. %s)
- ADMX4097 (Error when fetching the routing rule %s from database for the organization id %s. %s)
- ADMX4098 (Error returned when updating the routing rule %s from database for the organization id %s. %s)
- ADMX4099 (Error when updating the routing rule %s from database for the organization id %s. %s)
- ADMX4100 (Error returned when reordering the routing rules in database for the organization id %s. %s)
- ADMX4101 (Error when reordering the routing rules in database for the organization id %s. %s)
- ADMX4102 (Error returned when deleting the routing rule %s from database for the organization id %s. %s)
- ADMX4103 (Error when deleting the routing rule %s from database for the organization id %s. %s)
- ADMX4104 (Error returned when fetching the audit history of routing rules from database for the organization id %s. %s)
- ADMX4105 (Error when fetching the audit history of routing rules from database for the organization id %s. %s)
- ADMX4106 (Error returned when fetching the user details from the OAUTH/User Management server. %s)
- ADMX4107 (Error when fetching the user details from the OAUTH/User Management server. %s)
- ADMX4108 (Error returned when updating the user details in the OAUTH/User Management server. %s)
- ADMX4110 (Error retrieving event from blockchain for event id %s on blockchain %s for org %s: %s")
- ADMX4111 (Error retrieving masterdata from blockchain for masterdata id %s on blockchain %s for org %s: %s)
- ADMX4109 (Error when updating the user details in the OAUTH/User Management server. %s)
- ADMX9000 (Unknown error when fetching all alerts from the database for the organization id %s. %s)
- ADMX9001 (Unknown error when fetching the alert %s from the database for the organization id %s. %s)
- ADMX9002 (Unknown error when fetching alerts count from the database for the organization id %s. %s)
- ADMX9003 (Unknown error when clearing all alerts from the database for the organization id %s. %s)
- ADMX9004 (Unknown error when clearing the alert %s from the database for the organization id %s. %s)
- ADMX9005 (Unknown error when searching the event from the search service for the organization id %s. %s)
- ADMX9006 (Unknown error when fetching the event %s from the database for the organization id %s. %s)
- ADMX9007 (Unknown error when fetching distinct event sources from the database for the organization id %s. %s)
- ADMX9008 (Unknown error when fetching distinct event destinations from the database for the organization id %s. %s)
- ADMX9009 (Unknown error when fetching count of messages in processing queues from the event and masterdata services for the organization id %s. %s)
- ADMX9010 (Unknown error when fetching count of failed messages in deadletter queue from the event service for the organization id %s. %s)
- ADMX9011 (Unknown error when retrying failed messages in deadletter queue from the event service for the organization id %s. %s)
- ADMX9012 (Unknown error when setting the event queue status to pause/resume of processing queue from the event service for the organization id %s. %s)
- ADMX9013 (Unknown error when fetching the event processing queue status from the event service for the organization id %s. %s)
- ADMX9014 (Unknown error when fetching the organization of user from organization service. %s)
- ADMX9015 (Unknown error when updating the organization from organization service for the organozation id %s. %s)
- ADMX9016 (Unknown error when fetching the organization id from organization service. %s)
- ADMX9017 (Unknown error when fetching the list of organization users from organization service for organization id %s. %s)
- ADMX9018 (Unknown error when fetching all master data from database for organization id %s. %s)
- ADMX9019 (Unknown error when fetching the master data %s from database for organization id %s. %s)
- ADMX9020 (Unknown error when retrying the failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX9021 (Unknown error when fetching the count of failed masterdata messages in deadletter queue from RabbitMQ for organization id %s. %s)
- ADMX9022 (Unknown error when deleting the masterdata %s from database for organization id %s. %s)
- ADMX9023 (Unknown error when setting the masterdata queue status to pause/resume of processing queue from the masterdata service for the organization id %s. %s)
- ADMX9024 (Unknown error when fetching the count of messages processed from database for the organization id %s. %s)
- ADMX9025 (Unknown error when fetching the event messages processed for a given period from database for the organization id %s. %s)
- ADMX9026 (Unknown error when fetching the event messages processed by type from database for the organization id %s. %s)
- ADMX9027 (Unknown error when fetching the event messages processed by source from database for the organization id %s. %s)
- ADMX9028 (Unknown error when fetching the event messages processed by destination from database for the organization id %s. %s)
- ADMX9029 (Unknown error when fetching the event messages processed by status from database for the organization id %s. %s)
- ADMX9030 (Unknown error when fetching the list of configured data fields for data privacy rules from database for the organization id %s. %s)
- ADMX9031 (Unknown error when fetching the data privacy rules from database for the organization id %s. %s)
- ADMX9032 (Unknown error when creating the data privacy rule in database for the organization id %s. %s)
- ADMX9033 (Unknown error when fetching the data privacy rule %s from database for the organization id %s. %s)
- ADMX9034 (Unknown error when updating the data privacy rule %s in database for the organization id %s. %s)
- ADMX9035 (Unknown error when reordering the data privacy rules in database for the organization id %s. %s)
- ADMX9036 (Unknown error when deleting the data privacy rule %s from database for the organization id %s. %s)
- ADMX9037 (Unknown error when fetching the audit history of data privacy rules from database for the organization id %s. %s)
- ADMX9038 (Unknown error when fetching the list of configured data fields for routing rules from database . %s)
- ADMX9039 (Unknown error when fetching the list of configured comparators for routing rules from database. %s)
- ADMX9040 (Unknown error when fetching the list of configured destinations for routing rules from database. %s)
- ADMX9041 (Unknown error when fetching the routing rules from database for the organization id %s. %s)
- ADMX9042 (Unknown error when creating the routing rule in database for the organization id %s. %s)
- ADMX9043 (Unknown error when fetching the routing rule %s from database for the organization id %s. %s)
- ADMX9044 (Unknown error when updating the routing rule %s from database for the organization id %s. %s)
- ADMX9045 (Unknown error when reordering the routing rules in database for the organization id %s. %s)
- ADMX9046 (Unknown error when deleting the routing rule %s from database for the organization id %s. %s)
- ADMX9047 (Unknown error when fetching the audit history of routing rules from database for the organization id %s. %s)
- ADMX9048 (Unknown error when event from blockchain for event id %s on blockchain %s for org %s: %s)
- ADMX9049 (Unknown error when retrieving masterdata from blockchain for masterdata id %s on blockchain %s for org %s: %s)
