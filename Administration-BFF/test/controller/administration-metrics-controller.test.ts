/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import { AdministrationMetricsController } from '../../src/controller/administration-metrics-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

const { mockRequest, mockResponse } = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationMetricsController\' ", () => {
    test('Get the number of events processed 200 Response', async () => {
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
            eventMessages: 200,
            masterdataMessages: 300
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/processed';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token.",
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/processed';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed 500 Error Response', async () => {
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
            message: "Error returned when fetching the count of messages processed from database for the organization id 1.",
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/processed';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed 500 network  Error Response', async () => {
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
            message: "Error when fetching the count of messages processed from database for the organization id 1. Network Error",
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/processed';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed for a period 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.query.duration = "past week";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse =[{ "date": "8/25/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/26/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/27/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/28/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/29/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/30/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/31/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/period';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed for a period 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/period';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed for a period 500 Error Response', async () => {
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
            message: "Error returned when fetching the event messages processed for a given period from database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/period';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed for a period 500 network Error Response', async () => {
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
            message: "Error when fetching the event messages processed for a given period from database for the organization id 1. Network Error"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/period';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed by type 200 Response', async () => {
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
        const dprResponse = [{type: "object",count: 200}, {type: "aggregation",count: 300}, {type: "transaction",count: 100}, {type: "transformation",count: 50}]
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/type';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed by type 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/type';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed by type 500 Error Response', async () => {
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
            message: "Error returned when fetching the event messages processed by type from database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/type';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

        
    test('Get the number of events processed by type 500 network Error Response', async () => {
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
            message: "Error when fetching the event messages processed by type from database for the organization id 1. Network Error"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/type';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed by source 200 Response', async () => {
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
        const dprResponse = [{source: "source1", count: 27}, {source: "source2", count: 94}, {source: "source3", count: 160}];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/source';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed by source 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/source';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed by source 500 Error Response', async () => {
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
            message: "Error returned when fetching the event messages processed by source from database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/source';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed by source 500 network Error Response', async () => {
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
            message: "Error when fetching the event messages processed by source from database for the organization id 1. Network Error"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/source';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Get the number of events processed by destination 200 Response', async () => {
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
        const dprResponse = [{destination_name: "destination1", count: 278}, {destination_name: "destination2", count: 394}, {destination_name: "destination3", count: 100}];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/destination';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed by destination 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/destination';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get the number of events processed by destination 500 Error Response', async () => {
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
            message: "Error returned when fetching the event messages processed by destination from database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/destination';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

        
    test('Get the number of events processed by destination 500 network Error Response', async () => {
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
            message: "Error when fetching the event messages processed by destination from database for the organization id 1. Network Error"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/destination';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    test('Get the number of events processed by status 200 Response', async () => {
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
        const dprResponse = [{status: "on ledger", count: 498}, {status: "accepted", count: 334}, {status: "failed", count: 500}];
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/status';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed by status 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;

        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const dprResponse = {
            success: false,
            message: "Error getting organization id from request token."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, dprResponse);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/status';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
    
    test('Get the number of events processed by status 500 Error Response', async () => {
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
            message: "Error returned when fetching the event messages processed by status from database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/status';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get the number of events processed by status 500 network Error Response', async () => {
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
            message: "Error when fetching the event messages processed by status from database for the organization id 1. Network Error"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.METRICS_SERVICE + '/organization/1/events/status';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMetricsController = new AdministrationMetricsController();
        await controller.getMessagesByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });
});