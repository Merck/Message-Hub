/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationUsersController} from '../../src/controller/administration-users-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

let querystring = require('querystring');


const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationUsersController\' ", () => {
    beforeEach(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if( !process.env.OAUTH_SERVER){
            process.env = {
                OAUTH_SERVER: "https://someplace.com",
                USERINFO_ENDPOINT: "/userinfo",
                IAM_SERVER: 'https://iamserver.com',
                IAM_TOKEN_ENDPOINT: '/iamendpoint',
                MANAGEMENT_SERVER:'https://mgmtserver.com',
                ORGANIZATION_SERVICE: 'https://org-service.com'
            };
        }
    });

    test('getSelf 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const appIdResponse = {
            "given_name": "Merck",
            "family_name": "User",
            "name": "Merck User",
            "email": "test@test.com",
            "identities": [
                {
                    "provider": "cloud_directory",
                    "id": "a311bcbd-166b-441a-8516-0e05ef0a640e",
                    "idpUserInfo": {
                        "displayName": "Merck User",
                        "active": true,
                        "mfaContext": {},
                        "emails": [
                            {
                                "value": "test_user@merck.com",
                                "primary": true
                            }
                        ],
                        "meta": {
                            "lastLogin": "2020-08-19T18:38:45.240Z",
                            "created": "2020-08-19T17:21:51.308Z",
                            "location": "/v1/7e4f16cd-a5b8-45a2-9d65-4096a488e9ee/Users/a311bcbd-166b-441a-8516-0e05ef0a640e",
                            "lastModified": "2020-08-19T18:38:45.262Z",
                            "resourceType": "User"
                        },
                        "schemas": [
                            "urn:ietf:params:scim:schemas:core:2.0:User"
                        ],
                        "name": {
                            "givenName": "Merck",
                            "familyName": "User",
                            "formatted": "Merck User"
                        },
                        "id": "a311bcbd-166b-441a-8516-0e05ef0a640e",
                        "status": "CONFIRMED"
                    }
                }
            ],
            "sub": "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            "attributes": {}
        }

        const response = {
            userId: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            subjectId: "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            username: "test@test.com",
            givenName: "Merck",
            familyName: "User",
            displayName: "Merck User",
            roles:[]
        }

        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(200, appIdResponse);

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.getSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getSelf 401 Response - No Authorization', async () => {
        let req = mockRequest();
        let res = mockResponse();
        const response = {"success": false, "message": "No token in authorization header"};

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.getSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getSelf OAUTH timeout. no connection to oauth server', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).timeout()

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.getSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "success": false,
            "message": "Error when fetching the user details from the OAUTH/User Management server. timeout of 0ms exceeded"
        });
    });

    test('getSelf catch method error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).networkError();

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.getSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({"success": false, "message": "Error when fetching the user details from the OAUTH/User Management server. Network Error"});
    });

    
    test('getSelf OAUTH server error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(400, {data: "Network error"})

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.getSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({success: false, message: "Error returned when fetching the user details from the OAUTH/User Management server. {\"data\":\"Network error\"}"});
    });

    test('updateSelf success response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const appIdResponse = {
            preferred_username: "test@test.com",
            identities: [{id: "a311bcbd-166b-441a-8516-0e05ef0a640e"}],
            sub: "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            username: "test@test.com",
            given_name: "Merck",
            family_name: "User",
            name: "Merck User",
            roles:[]
        };
        const jwtResponse = {access_token: access_token}
        const userProfileResp = {
            id: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            userName: "test@test.com",
            name: {
                givenName: "Merck",
                familyName: "user",
                formatted: "Merck user",
            }
        };
        const userProfile = {
            userId: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            subjectId: "",
            username: "test@test.com",
            givenName: "Merck",
            familyName: "user",
            displayName: "Merck user",
            roles: []
        };
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(200, appIdResponse);
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/' + userProfile.userId).reply(200, userProfileResp);

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(userProfile);
    });

    
    test('updateSelf for update in username success response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test2@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const appIdResponse = {
            preferred_username: "test@test.com",
            identities: [{id: "a311bcbd-166b-441a-8516-0e05ef0a640e"}],
            sub: "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            username: "test@test.com",
            given_name: "Merck",
            family_name: "User",
            name: "Merck User",
            roles:[]
        };
        const jwtResponse = {access_token: access_token}
        const userProfileResp = {
            id: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            userName: "test2@test.com",
            name: {
                givenName: "Merck",
                familyName: "user",
                formatted: "Merck user",
            }
        };
        const userProfile = {
            userId: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            subjectId: "",
            username: "test2@test.com",
            givenName: "Merck",
            familyName: "user",
            displayName: "Merck user",
            roles: []
        };
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        const data = {
            newusername: req.body.newusername
        };
        const orgIdResp = {organization_id: 1}
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(200, appIdResponse);
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/' + userProfile.userId).reply(200, userProfileResp);
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPatch(process.env.ORGANIZATION_SERVICE + '/organizations/1/users/4d98d0a6-b73d-415a-85c7-e097d68e6862', data).reply(200, userProfileResp)

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(userProfile);
    });


    test('updateSelf 400 error response- missing parameters', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            new_username: "test@test.com"
        }
        const res = mockResponse();
        const resp = {
            success: false,
            message: 'one or more parameters (newusername, newfirstname, newlastname) are required in request body'
        }
        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });


    test('updateSelf error response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const resp= {
            message: 'Error returned when updating the user details in the OAUTH/User Management server. {\"message\":\"Network Error at oauth server\"}',
            success: false
        }
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(400, {message: 'Network Error at oauth server'});

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('updateSelf network error response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const resp= {
            success: false,
            message: 'Error when updating the user details in the OAUTH/User Management server. Network Error'
        }
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).networkError()

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('updateSelf no jwt error response', async () => {
        let req = mockRequest();
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const resp= {
            success: false,
            message: 'No token in authorization header'
        }

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('updateSelf jwt error response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const appIdResponse = {
            preferred_username: "test@test.com",
            identities: [{id: "a311bcbd-166b-441a-8516-0e05ef0a640e"}],
            sub: "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            username: "test@test.com",
            given_name: "Merck",
            family_name: "User",
            name: "Merck User",
            roles:[]
        };
        const jwtResponse = {message: 'Error at IAM server'}
        const resp = {
            success: false,
            message: 'Error returned when updating the user details in the OAUTH/User Management server. {\"message\":\"Error at IAM server\"}'
        }

        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(200, appIdResponse);
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(400, jwtResponse)

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('updateSelf error response when updating user details', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = {
            newusername: "test@test.com",
            newfirstname: "Merck",
            newlastname: "user"
        }
        const res = mockResponse();
        const appIdResponse = {
            preferred_username: "test@test.com",
            identities: [{id: "a311bcbd-166b-441a-8516-0e05ef0a640e"}],
            sub: "068e77cd-75dc-4939-8a09-9480b5c94fc1",
            username: "test@test.com",
            given_name: "Merck",
            family_name: "User",
            name: "Merck User",
            roles:[]
        };
        const jwtResponse = {access_token: access_token}
        const resp = {
            success: false,
            message: 'Error when updating the user details in the OAUTH/User Management server. Network Error'
        }
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let mock = new MockAdapter(axios);
        mock.onGet((process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT).reply(200, appIdResponse);
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/a311bcbd-166b-441a-8516-0e05ef0a640e').networkError();

        let controller: AdministrationUsersController = new AdministrationUsersController();
        await controller.updateSelf(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });
});