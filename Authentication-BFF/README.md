# Authentication Backend-for-Frontend (BFF)

## Overview

### Purpose:

The Authentication BFF provides externally-exposed, publicly-accessible APIs
for authenticating with the Messaging Hub backend, obtaining JWT tokens for accessing other APIS,
and managing password flows for system users.

This service does not perform any of authentication functions, but relies on those
functions being available via an authentication server, IBM App ID in this case.

### Implementation:

The BFF is implemented using Node.js, Express, and TypeScript. The backend authentication
is handled by IBM App ID, but can be easily modified to use a different OAuth2-compliant
authentication server.

### Primary functions:

The BFF provides the following API for public use:

- **POST /oauth​/token** which allows for standard OAuth2 client_credential, password and refresh_token grant types.
  Upon successful authentication it returns a set of tokens to be used to authenticate with other services.
- **POST /oauth/revoke** which revokes the user's current tokens.
- **POST /oauth​/forgotpassword** which begins the back-end process of resetting a user's password. App ID will send an
  email to user containing instructions and a one-time, limited-life link (containing a reset token) in which to perform the reset.
- **POST /oauth/forgotpassword/confirm** which verifies that the reset token presented by the user is valid and has not been previously used.
  If valid, the endpoint returns the user's UUID from App ID which can then be used to change the password.
- **POST /oauth/changepassword** which changes the user's (identified by their UUID) password. App ID sends a confirmation email if the
  password is successfully changed.

### Flows

The sequence diagram illustrates the typical API flow for OAuth-related API calls.
![alt text](OAuth%20Authentication%20Flow.png)

<br /><br />
The sequence diagram illustrates the typical API flow for User Management-related API calls.
![alt text](User%20Management%20Flow.png)

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

This project is fully integrated in a CI/CD pipeline. To deploy this code, create a merge
request in the Git repository and merge that into the development branch.

Deployment is performed by the pipeline using Helm charts which spin up the necessary number of pods on a Kubernetes environment.

### App ID setup

App Id does not generate refresh_tokens by default, nor does it return user roles in the JWT claims. The following configuration must be performed
as described here https://cloud.ibm.com/docs/appid?topic=appid-customizing-tokens

1. Use the App ID GUI to create service credentials
2. Use the IAM GUI to assign service manager access to the credential
3. Use the App ID GUI to get the API Key from the credentials
4. Get an IAM access token
   - call https://iam.cloud.ibm.com/identity/token with grant_type urn:ibm:params:oauth:grant-type:apikey
     and the apikey
   - get the access token
5. Update the App ID token config
   - call PUT https://us-south.appid.cloud.ibm.com/management/v4/7e4f16cd-a5b8-45a2-9d65-4096a488e9ee/config/tokens
   - post the following payload
   ```json
   {
     "access": {
       "expires_in": 3600
     },
     "refresh": {
       "enabled": true,
       "expires_in": 86400
     },
     "anonymousAccess": {
       "enabled": false,
       "expires_in": 86400
     },
     "accessTokenClaims": [
       {
         "source": "roles"
       }
     ]
   }
   ```

### Environment setup

This project require the following environment variables to be properly configured:

- OAUTH_SERVER: the URL to the OAUTH authentication server, for example: '`https://us-south.appid.cloud.ibm.com/oauth/v4/...`'
- TOKEN_ENDPOINT: the OAUTH authentication server's token endpoint, for example: '`/token`',
- REVOKE_ENDPOINT the OAUTH authentication server's revoke tokens endpoint, for example: '`/revoke`',
- CLIENT_ID: A valid client id for this BFF to access and use the authentication server's APIs
- CLIENT_SECRET: A valid client secret for this BFF to access and use the authentication server's APIs
- MANAGEMENT_SERVER: the URL to the User Management server, for example: '`https://us-south.appid.cloud.ibm.com/management/v4/...`',
- FORGOT_PASSWORD_ENDPOINT: the User Management server's forgot password endpoint, for example: '`/cloud_directory/forgot_password`',
- FORGOT_PASSWORD_CONFIRM_ENDPOINT: the User Management server's reset token verification endpoint, for example:'`/cloud_directory/forgot_password/confirmation_result`',
- CHANGE_PASSWORD_ENDPOINT: the User Management server's change password endpoint, for example: '`/cloud_directory/change_password`',
- IAM_SERVER: the URL to the IAM server for obtaining IAM tokens needed to call User Management server APIs, for example: '`https://iam.cloud.ibm.com`',
- IAM_TOKEN_ENDPOINT: the IAM server's token endpoint, for example: '`/identity/token`'
- APIKEY: A valid API key for obtaining a IAM server token
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

- AUTX4000 (Couldn't post new alert to alert-service.
- AUTX4001 (Couldn't obtain a set of tokens. OAuth server returned error: %s.
- AUTX4002 (Couldn't revoke access tokens. OAuth server returned error: %s.
- AUTX4003 (Couldn't initiate Forgot Password workflow. OAuth server returned error: %s.
- AUTX4004 (Couldn't initiate Confirm Password Reset workflow. OAuth server returned error: %s.
- AUTX4005 (Couldn't initiate Change Password workflow. OAuth server returned error: %s.

- AUTX9000 (Unknown error while trying to obtain a set of tokens. %s.
- AUTX9001 (Unknown error while trying to revoke access tokens. %s.
- AUTX9002 (Unknown error while trying to initiate Forgot Password workflow. %s.
- AUTX9003 (Unknown error while trying to initiate Confirm Password Reset workflow. %s.
- AUTX9004 (Unknown error while trying to initiate Change Password workflow. %s.
