/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationOrganizationUsersController} from '../../src/controller/administration-organization-users-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

let querystring = require('querystring');


const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationOrganizationUsersController\' ", () => {
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

    test('getAll users 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = [{
            username: 'test@test.org',
            organization_id: 1,
            subject_id: 'fsjds9-54374743-hgfdhjfd'
        },
        {
            username: 'test2@test.org',
            organization_id: 1,
            subject_id: 'fghsds9-54098843-hg6kfdd'
        }]
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onGet(process.env.ORGANIZATION_SERVICE+ '/organizations/1/users/').reply(200, resp);
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getAllUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('getAll users 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            "message": "Error returned when fetching the list of organization users from organization service for organization id 1. {\"message\":\"Network Error\"}",
             "success": false
        }
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onGet(process.env.ORGANIZATION_SERVICE+ '/organizations/1/users/').reply(400, {message: "Network Error"});
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getAllUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('getAll users network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            success: false,
            message: 'Error when fetching the list of organization users from organization service for organization id 1. Network Error'
        }
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onGet(process.env.ORGANIZATION_SERVICE+ '/organizations/1/users/').networkError();
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getAllUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    
    test('getAll users error Response- no auth header', async () => {
        let req = mockRequest();
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = [{
            username: 'test@test.org',
            organization_id: 1,
            subject_id: 'fsjds9-54374743-hgfdhjfd'
        },
        {
            username: 'test2@test.org',
            organization_id: 1,
            subject_id: 'fghsds9-54098843-hg6kfdd'
        }]
        const response = {
            success: false,
            message: 'Unknown error when fetching the list of organization users from organization service for organization id . No authorization header received'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE+ '/organizations/1/users/').reply(200, resp);
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getAllUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    })

    
    test('createUser 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const userProfile = {
            userId: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            subjectId: "",
            username: "test@test.com",
            givenName: "test",
            familyName: "org",
            displayName: "test org",
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        };
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        const userProfileResp = {
            id: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            userName: "test@test.com",
            name: {
                givenName: "test",
                familyName: "org",
                formatted: "test org",
            }
        };
        const subjResp = {
            users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]
        }
        const rolesResp = {
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }

        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + "/users").reply(200, 'user created')
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users').reply(200, userProfileResp);
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subjResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/roles").reply(200, rolesResp)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + "/users/" + subjResp.users[0].id + "/roles", payload).reply(200, rolesResp)
        mock.onPost(process.env.ORGANIZATION_SERVICE + '/organizations/1/users/').reply(200, {message: 'user created'});
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(userProfile);
    })

    test('createUser 400 Response- username missing', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        const resp = {
            "success": false, "message": "username is required in request body"
        }
        let res = mockResponse();
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('createUser 400 Response- password missing', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        const resp = {
            "success": false, "message": "password is required in request body"
        }
        let res = mockResponse();
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('createUser 400 Response- firstname missing', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test123',
            lastname: 'org',
            isadmin: true
        }
        const resp = {
            "success": false, "message": "firstname is required in request body"
        }
        let res = mockResponse();
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('createUser 400 Response- lastname missing', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test123',
            firstname: 'test',
            isadmin: true
        }
        const resp = {
            "success": false, "message": "lastname is required in request body"
        }
        let res = mockResponse();
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('createUser 400 no auth header error Response', async () => {
        let req = mockRequest();
        req.body= {
            username: "test@test.com",
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        let res = mockResponse();
        const orgIdResp = {message: 'No authorization header received'}
        const resp = {"message": "Error when creating a new organization user from organization service for organization id . No authorization header received", "success": false}
        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(400, orgIdResp)
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('createUser 400 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const jwtResponse = {access_token: access_token}
        const resp = {success: false, message: 'Error when creating a new organization user from organization service for organization id 1. Network Error'}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };

        const subjResp = {
            users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]
        }
        const rolesResp = {
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }

        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + "/users").networkError();

        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    
    test('createUser 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const jwtResponse = {access_token: access_token}
        const resp = {"message": "Error returned when creating a new organization user from organization service for organization id 1. {\"message\":\"Network Error\"}",
        "success": false}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };

        const subjResp = {
            users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]
        }
        const rolesResp = {
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }

        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + "/users").reply(400, {message: "Network Error"});

        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

        
    test('createUser 400 error Response- subject id not present', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            username: "test@test.com",
            password: 'test1234',
            firstname: 'test',
            lastname: 'org',
            isadmin: true
        }
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const userProfile = {
            userId: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            subjectId: "",
            username: "test@test.com",
            givenName: "test",
            familyName: "org",
            displayName: "test org",
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        };
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        const userProfileResp = {
            id: "a311bcbd-166b-441a-8516-0e05ef0a640e",
            userName: "test@test.com",
            name: {
                givenName: "test",
                familyName: "org",
                formatted: "test org",
            }
        };
        const subjResp = {
            users: [{id: ''}]
        }
        const rolesResp = {
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }

        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        let resp = { "success": false, "message": "subject ID not found with username test@test.com" }
        const orgIdResp = {organization_id: 1}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + "/users").reply(200, 'user created')
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users').reply(200, userProfileResp);
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subjResp)

        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.createUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('get user 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            userId: '21323-7645hg-5hslen',
            subjectId: '',
            username: 'test@test.com',
            givenName: 'test',
            familyName: 'org',
            displayName: 'test org',
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users/4d98d0a6-b73d-415a-85c7-e097d68e6862/roles").reply(200, rolesResp)
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('get user 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            success: false,
            message: 'Error returned when fetching user details of test@test.com from organization service for organization id 1. {\"message\":\"Error at management response\"}'
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            message: 'Error at management response'
        };

        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(400, mgmtResp)

        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('get user 400 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            userId: '21323-7645hg-5hslen',
            subjectId: '',
            username: 'test@test.com',
            givenName: 'test',
            familyName: 'org',
            displayName: 'test org',
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            success: false,
            message: 'Error when fetching user details of test@test.com from organization service for organization id 1. Network Error'
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").networkError()

        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(mgmtResp);
    })

    test('get user 400 user error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp ={ success: false, message: "No user found for userName test@test.com" }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.getUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    
    test('update user 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        req.body.newusername='test@test.com';
        req.body.newfirstname= 'test2';
        req.body.newlastname = 'org';
        req.body.isadmin = 'true'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            userId: '21323-7645hg-5hslen',
                givenName: 'test',
                familyName: 'org',
            displayName: 'test org',
            subjectId: '',
            username: 'test@test.com',
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }
        const updateuserResp = {
            id: '21323-7645hg-5hslen',
            userName: 'test@test.com',
            name: {givenName: 'test',
            familyName: 'org',
            formatted: 'test org'
            }
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/21323-7645hg-5hslen').reply(200, updateuserResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users/4d98d0a6-b73d-415a-85c7-e097d68e6862/roles").reply(200, rolesResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/roles").reply(200, rolesResp)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + "/users/" + subResp.users[0].id + "/roles", payload).reply(200, rolesResp)
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.updateUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('update user 400 Response- new username missing', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        req.body = {}
        let res = mockResponse();
        const resp= {
            "success": false,
            "message": "one or more parameters (newusername, newfirstname, newlastname, isadmin) are required in request body"
        }
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.updateUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });

    test('update user 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        req.body.newusername='test@test.com';
        req.body.newfirstname= 'test2';
        req.body.newlastname = 'org';
        req.body.isadmin = 'true'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            success: false,
            message: 'Error returned when updating the user details of test@test.com from organization service for organization id 1. {\"message\":\"Error updating in appid\"}'
        }
        const updateuserResp = {
            message: 'Error updating in appid'
            
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/21323-7645hg-5hslen').reply(400, updateuserResp)
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.updateUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('update user 400 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'
        req.body.newusername='test@test.com';
        req.body.newfirstname= 'test2';
        req.body.newlastname = 'org';
        req.body.isadmin = 'true'
        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            success: false,
            message: 'Error when updating the user details of test@test.com from organization service for organization id 1. Network Error'
        }
        const updateuserResp = {
            message: 'Error updating in appid'
            
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        mock.onPut((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/21323-7645hg-5hslen').networkError()
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.updateUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    })

    test('delete user 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'

        let res = mockResponse();
        let mock = new MockAdapter(axios);
        const resp = {
            userId: '21323-7645hg-5hslen',
                givenName: 'test',
                familyName: 'org',
            displayName: 'test org',
            subjectId: '',
            username: 'test@test.com',
            roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]
        }
        const deleteResp = {success: true, message: 'user deleted'};
        const updateuserResp = {
            id: '21323-7645hg-5hslen',
            userName: 'test@test.com',
            name: {givenName: 'test',
            familyName: 'org',
            formatted: 'test org'
            }
        }
        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subResp)
        mock.onDelete(process.env.ORGANIZATION_SERVICE + '/organizations/1/users/4d98d0a6-b73d-415a-85c7-e097d68e6862').reply(200, deleteResp)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=test@test.com").reply(200, mgmtResp)
        mock.onDelete((process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/remove/21323-7645hg-5hslen').reply(200, deleteResp)
        
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.deleteUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(deleteResp);
    });

    test('delete user 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'

        let res = mockResponse();
        let mock = new MockAdapter(axios);

        const resp = {success: false, message: 'Error returned when deleting the user test@test.com from organization service for organization id 1. {\"message\":\"Error in deleting the user\"}'}
        const deleteResp = {message: 'Error in deleting the user'};

        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subResp)
        mock.onDelete(process.env.ORGANIZATION_SERVICE + '/organizations/1/users/4d98d0a6-b73d-415a-85c7-e097d68e6862').reply(400, deleteResp)
        
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.deleteUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });
    test('delete user 400 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.userName = 'test@test.com'

        let res = mockResponse();
        let mock = new MockAdapter(axios);

        const resp = {success: false, message: 'Error when deleting the user test@test.com from organization service for organization id 1. Network Error'}
        const deleteResp = {message: 'Error in deleting the user'};

        const rolesResp = {roles: [{name: 'organization_user', id: 1}, {name: 'organization_admin', id : 2}]}
        const subResp = {users: [{id: '4d98d0a6-b73d-415a-85c7-e097d68e6862'}]}
        const mgmtResp = {
            Resources:[{
                id: '21323-7645hg-5hslen',
                name: {
                    givenName: 'test',
                    familyName: 'org',
                    formatted: 'test org'
                },
                emails: [{
                    value: 'test@test.com'
                }]
            }
            ]
        };
        
        const orgIdResp = {organization_id: 1};
        const jwtResponse = {access_token: access_token}
        const iam_data = {
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
            apikey: process.env.APIKEY
        };
        let payload = {
            roles: {
                ids: [1,2]
            }
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgIdResp)
        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT, querystring.stringify(iam_data)).reply(200, jwtResponse)
        mock.onGet((process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=test@test.com").reply(200, subResp)
        mock.onDelete(process.env.ORGANIZATION_SERVICE + '/organizations/1/users/4d98d0a6-b73d-415a-85c7-e097d68e6862').networkError()
        
        let controller: AdministrationOrganizationUsersController = new AdministrationOrganizationUsersController();
        await controller.deleteUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(resp);
    });
});