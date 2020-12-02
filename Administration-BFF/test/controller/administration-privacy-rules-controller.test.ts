/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationPrivacyRulesController} from '../../src/controller/administration-privacy-rules-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationPrivacyRulesController\' ", () => {

    test('Create Data privacy rules 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "editor": "ex@cmpny.com"
        };
        req.body = request
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "id": 12,
            "organization_id": 1,
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "status": "ACTIVE"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.createDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Create Data privacy rules 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "editor": "ex@cmpny.com"
        };
        req.body = request
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.createDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Create Data privacy rules 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "editor": "ex@cmpny.com"
        };
        req.body = request
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error returned when creating the data privacy rule in database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.createDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Create Data privacy rules 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "editor": "ex@cmpny.com"
        };
        req.body = request
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error when creating the data privacy rule in database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.createDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get all Data privacy rules 200 Response', async () => {
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
        const dprResponse = [{
            "id": 12,
            "organization_id": 1,
            "data_field": 7,
            "can_store": true,
            "order": 3,
            "status": "ACTIVE"
        }, {
            "id": 11,
            "organization_id": 1,
            "data_field": 5,
            "can_store": true,
            "order": 2,
            "status": "ACTIVE"
        }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get all Data privacy rules 401 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get all Data privacy rules 500 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the data privacy rules from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get all Data privacy rules 500 network error Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error when fetching the data privacy rules from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get history of Data privacy rule 200 Response', async () => {
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
        const dprResponse = [{
            "rules_id": 1,
            "change_description": "CREATED",
            "editor": "editor",
            "timestamp": "2020-08-11T11:30:47.0Z",
            "datafield_type": "masterdata",
            "new_datafield_display": "Master Data",
            "new_order": 3,
            "can_store": false
        }, {"rules_id": 1,
        "change_description": "UPDATED",
        "editor": "editor",
        "timestamp": "2020-08-12T11:30:47.0Z",
        "datafield_type": "masterdata",
        "new_datafield_display": "Master Data",
        "new_order": 3,
        "can_store": true
    }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get history of Data privacy rule 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get history of Data privacy rule 500 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the audit history of data privacy rules from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get history of Data privacy rule 500 network error Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error when fetching the audit history of data privacy rules from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Update Data privacy rules for rule id 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 8,
            "can_store": false,
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "id": 12,
            "organization_id": 1,
            "data_field": 8,
            "can_store": false,
            "order": 3,
            "status": "ACTIVE"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Update Data privacy rules for rule id 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 8,
            "can_store": false,
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Update Data privacy rules for rule id 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 8,
            "can_store": false,
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error returned when updating the data privacy rule 1 in database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Update Data privacy rules for rule id 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "data_field": 8,
            "can_store": false,
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error when updating the data privacy rule 1 in database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Reorder Data privacy rules 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "rulesordered":  [4,8,3,5],
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": true,
            "message": "rules updated"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Reorder Data privacy rules 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "rulesordered":  [4,8,3,5],
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error getting organization id from request token."
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Reorder Data privacy rules 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "rulesordered":  [4,8,3,5],
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error returned when reordering the data privacy rules in database for the organization id 1."
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Reorder Data privacy rules 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "rulesordered":  [4,8,3,5],
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error when reordering the data privacy rules in database for the organization id 1. Network Error"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Data privacy rule 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": true,
            "message": "rule deleted"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Data privacy rule 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error getting organization id from request token."
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Data privacy rule 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 5;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error returned when deleting the data privacy rule 5 from database for the organization id 1."
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Delete Data privacy rule 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 5;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const request = {
            "editor": "ex@cmpny.com"
        };
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "success": false,
            "message": "Error when deleting the data privacy rule 5 from database for the organization id 1. Network Error"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Data privacy rule for ruleid 200 Response', async () => {
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
        const dprResponse = {
            "id": 4,
            "organization_id": 1,
            "data_field": 3,
            "can_store": true,
            "order": 5,
            "new_datafield_display": "Master Data",
            "new_order": 3,
            "datafield_type": "masterdata",
            "datafield_display": "Master Data",
            "datafield_path": "urn:epcglobal:epcis:vtype:ReadPoint"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get Data privacy rule for ruleid 401 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Data privacy rule for ruleid 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId=3
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the data privacy rule 3 from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get Data privacy rule for ruleid 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId=3
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: false,
            message: 'Error when fetching the data privacy rule 3 from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/1/dataprivacyrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Data privacy data field  200 Response', async () => {
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
        const dprResponse = [{
            "id": 4,
            "path": "$somepath.someelement",
            "display_name": "Element",
            "data_type": "aggregation"
        }, {
            "id": 3,
            "path": "$somepath.someelement2",
            "display_name": "Element2",
            "data_type": "object"
        }, {
            "id": 7,
            "path": "$somepath.readpoint",
            "display_name": "Read Point",
            "data_type": "masterdata"
        }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/dataprivacyrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Data privacy data field  401 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/dataprivacyrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Get Data privacy data field  500 Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the list of configured data fields for data privacy rules from database for the organization id 1.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/dataprivacyrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Data privacy data field 500 network error Response', async () => {
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
        const dprResponse = {
            success: false,
            message: 'Error when fetching the list of configured data fields for data privacy rules from database for the organization id 1. Network Error'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.DATA_PRIVACY_RULES_SERVICE + '/dataprivacyrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationPrivacyRulesController = new AdministrationPrivacyRulesController();
        await controller.getDataPrivacyRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
});