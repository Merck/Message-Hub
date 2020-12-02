/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationOrganizationController} from '../../src/controller/administration-organization-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';


const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdmininstrationOrganizationController\' ", () => {

    test('GetOrganization 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response)

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('GetOrganization 404 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"success": false, "message": "no organization found for user subject id"}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(404, response)

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('GetOrganization no auth token', async () => {
        let req = mockRequest();
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"success": false, "message": "Error when fetching the organization of user from organization service. No authorization header received"}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(404, response)

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(2)
        expect(res.send.mock.calls.length).toBe(2);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('GetOrganization network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"success": false, "message": "Error when fetching the organization of user from organization service. timeout of 0ms exceeded"}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').timeout();

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('GetOrganization network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"success": false, "message": "Error when fetching the organization of user from organization service. Network Error"}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').networkError();

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('update Organization 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        req.body = {name: "new org name"};
        let mock = new MockAdapter(axios);
        const orgresponse = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const response = {
            id: 1,
            name: 'new org name'
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgresponse);
        const orgUri = process.env.ORGANIZATION_SERVICE + '/organizations/1';
        const url = new RegExp(`${orgUri}/*`);
        mock.onPatch(url).reply(200, response);

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    
    test('update Organization 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        req.body = {name: "new org name"};
        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}
        const response = {
            id: 1,
            name: 'new org name'
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);
        const orgUri = process.env.ORGANIZATION_SERVICE + '/organizations/1';
        const url = new RegExp(`${orgUri}/*`);
        mock.onPatch(url).reply(401, orgresponse);

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('update Organization 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        req.body = {name: "new org name"};
        let mock = new MockAdapter(axios);
        const orgresponse = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const response = {
            success: false,
            message: 'Error returned when updating the organization from organization service for the organization id 1.'
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgresponse);
        const orgUri = process.env.ORGANIZATION_SERVICE + '/organizations/1';
        const url = new RegExp(`${orgUri}/*`);
        mock.onPatch(url).reply(500, response);

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(response);
    });

    
    test('update Organization 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        req.body = {name: "new org name"};
        let mock = new MockAdapter(axios);
        const orgresponse = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const response = {
            success: false,
            message: 'Error when updating the organization from organization service for the organization id 1. Network Error'
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, orgresponse);
        const orgUri = process.env.ORGANIZATION_SERVICE + '/organizations/1';
        const url = new RegExp(`${orgUri}/*`);
        mock.onPatch(url).networkError();

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('update Organization 500 network error in org service Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();
        req.body = {name: "new org name"};
        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error when fetching the organization id from organization service. Network Error"}
        const response = {
            id: 1,
            name: 'new org name'
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').networkError();
        const orgUri = process.env.ORGANIZATION_SERVICE + '/organizations/1';
        const url = new RegExp(`${orgUri}/*`);
        mock.onPatch(url).reply(500, orgresponse);

        let controller: AdministrationOrganizationController = new AdministrationOrganizationController();
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });
});