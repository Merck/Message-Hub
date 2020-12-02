/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationRoutingRulesController} from '../../src/controller/administration-routing-rules-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationRoutingRulesController\' ", () => {
    test('Get Routing rules data field  200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = [{
            "id": 4,
            "path": "$somepath.someelement",
            "display_name": "Element",
            "value_prefix": "urn:epc:id:sgtin:",
            "data_type": "aggregation"
        }, {
            "id": 3,
            "path": "$somepath.someelement2",
            "display_name": "Element2",
            "value_prefix": "urn:epc:id:sgtin:",
            "data_type": "object"
        }, {
            "id": 7,
            "path": "$somepath.readpoint",
            "display_name": "Read Point",
            "value_prefix": "urn:epc:id:sgtin:",
            "data_type": "masterdata"
        }];

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules data field 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the list of configured data fields for routing rules from database.'
        }

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules data field 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error when fetching the list of configured data fields for routing rules from database. Network Error'
        }

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/datafields';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDataFieldsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules comparators 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = [{
            "id": 4,
            "operation": "equal",
            "display_name": "is equal to"
        }, {
            "id": 3,
            "operation": "like",
            "display_name": "is like"
        }, {
            "id": 2,
            "operation": "greater",
            "display_name": "is greater than"
        }];

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/comparators';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleComparatorsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules comparators 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the list of configured comparators for routing rules from database.'
        };

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/comparators';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleComparatorsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules comparators 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error when fetching the list of configured comparators for routing rules from database. Network Error'
        };

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/comparators';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleComparatorsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules destinations 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = [{
            "id": 4,
            "service_name": "mock_adapter",
            "display_name": "Mock Adapter",
            "active": true
        }, {
            "id": 1,
            "service_name": "mock_adapter2",
            "display_name": "Mock Adapter 2",
            "active": true
        }];

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/destinations';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules destinations 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error returned when fetching the list of configured destinations for routing rules from database.'
        }

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/destinations';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rules destinations 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const dprResponse = {
            success: false,
            message: 'Error when fetching the list of configured destinations for routing rules from database. Network Error'
        }

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/routingrules/config/destinations';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get All Routing rules 200 Response', async () => {
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
            "organization_id": 1,
            "data_field": 1,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "8888555.64348.*",
            "destinations": ["mock-adapter"],
            "order": 1
        }, {
            "id": 2,
            "organization_id": 1,
            "data_field": 2,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "444999.232.*",
            "destinations": ["mock-adapter2"],
            "order": 1
        }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get All Routing rules 500 Response', async () => {
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
            message: 'Error returned when fetching the routing rules from database for the organization id 1.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get All Routing rules 500 netowrk error Response', async () => {
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
            message: 'Error when fetching the routing rules from database for the organization id 1. Network Error'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Create Routing rules 200 Response', async () => {
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
        req.body = {
            data_field: 2,
            comparator: 3,
            value: '6443.58.*',
            destinations: ["mock-adapter2"],
            order: 2,
            editor: "test@test.org"
        };
        const dprResponse = {
            "id": 2,
            "organization_id": 1,
            "data_field": 2,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "6443.58.*",
            "destinations": ["mock-adapter2"],
            "order": 2
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.createRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Create Routing rules 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        req.body = {
            data_field: 2,
            comparator: 3,
            value: '6443.58.*',
            destinations: ["mock-adapter2"],
            order: 2,
            editor: "test@test.org"
        };
        const dprResponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(401, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.createRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Create Routing rules 500 Response', async () => {
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
        req.body = {
            data_field: 2,
            comparator: 3,
            value: '6443.58.*',
            destinations: ["mock-adapter2"],
            order: 2,
            editor: "test@test.org"
        };
        const dprResponse = {
            success: false,
            message: 'Error returned when creating the routing rule in database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.createRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Create Routing rules 500 network error Response', async () => {
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
        req.body = {
            data_field: 2,
            comparator: 3,
            value: '6443.58.*',
            destinations: ["mock-adapter2"],
            order: 2,
            editor: "test@test.org"
        };
        const dprResponse = {
            success: false,
            message: 'Error when creating the routing rule in database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).networkError()

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.createRoutingRules(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rule 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            "id": 2,
            "organization_id": 1,
            "data_field": 2,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "6443.58.*",
            "destinations": ["mock-adapter2"],
            "order": 2
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rule 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
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
            message: 'Error returned when fetching the routing rule 2 from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Routing rule 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
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
            message: 'Error when fetching the routing rule 2 from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Update Routing rule 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        req.body= {
            value: "64438.846.*"
        }
        const dprResponse = {
            "id": 2,
            "organization_id": 1,
            "data_field": 2,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "64438.846.*",
            "destinations": ["mock-adapter2"],
            "order": 2
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Update Routing rule 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        req.body= {
            value: "64438.846.*"
        }
        const dprResponse = {
            success: false,
            message: 'Error returned when updating the routing rule 2 from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Update Routing rule 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        req.body= {
            value: "64438.846.*"
        }
        const dprResponse = {
            success: false,
            message: 'Error when updating the routing rule 2 from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Routing rule 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = {
            success: true,
            message: 'Routing rule deleted'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Routing rule 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
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
            message: 'Error returned when deleting the routing rule 2 from database for the organization id 1.'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Delete Routing rule 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.ruleId = 2;
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
            message: 'Error when deleting the routing rule 2 from database for the organization id 1. Network Error'
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/2';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('reordering Routing rule 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            rulesordered: [2,6,1,3,4],
            editor: "test@test.org"
        }
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const dprResponse = {
            success: true,
            message: "routing rules reordered"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('reordering Routing rule 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            rulesordered: [2,6,1,3,4],
            editor: "test@test.org"
        }
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
            message: "Error returned when reordering the routing rules in database for the organization id 1."
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('reordering Routing rule 500 netowrk error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body= {
            rulesordered: [2,6,1,3,4],
            editor: "test@test.org"
        }
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
            message: "Error when reordering the routing rules in database for the organization id 1. Network Error"
        };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPatch(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Audit history Routing rules 200 Response', async () => {
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
            "organization_id": 1,
            "change_description": "CREATED",
            "timestamp": "2020-08-14T16:15:54.968Z",
            "data_field": 1,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "8888555.64348.*",
            "destinations": ["mock-adapter"],
            "order": 1,
            "editor": "test@test.org"
        }, {
            "id": 4,
            "organization_id": 1,
            "change_description": "UPDATED",
            "timestamp": "2020-08-15T16:15:54.968Z",
            "data_field": 2,
            "datafield_type": "object",
            "datafield_display": "Object",
            "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
            "datafield_prefix": "urn:epc:id:sgtin:",
            "comparator": 3,
            "comparator_operation": "isLike",
            "comparator_display": "is like *",
            "value": "444999.242211.*",
            "destinations": ["mock-adapter"],
            "order": 1
        }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Audit history Routing rules 500 Response', async () => {
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
            message: 'Error returned when fetching the audit history of routing rules from database for the organization id 1.'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get Audit history Routing rules 500 netowrk error Response', async () => {
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
            message: 'Error when fetching the audit history of routing rules from database for the organization id 1. Network Error'
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ROUTING_RULES_SERVICE + '/organization/1/routingrules/history';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationRoutingRulesController = new AdministrationRoutingRulesController();
        await controller.getRoutingRuleHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
});