/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationEventsController} from '../../src/controller/administration-events-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';
import {AdministrationMasterdataController} from "../../src/controller/administration-masterdata-controller";


const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdmininstrationEventsController\' ", () => {

    test('Search 200 Response', async () => {
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

        const searchresponse = {
            currentPage: 1,
            results: [
                {
                    action: "observe",
                    destination: "Mock Adapter",
                    id: "d434222e-0729-4917-b912-cee31ec93e17",
                    organization: "1",
                    source: "System 1 for Org 1",
                    status: "on_ledger"
                }
            ],
            resultsPerPage: 25,
            totalPages: 1,
            totalResults: 16,
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response)
        mock.onGet(process.env.SEARCH_SERVICE + '/search/organizations/1/events').reply(200, searchresponse)

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.search(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(searchresponse);
    });

    test('Search search-service error', async () => {
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

        const searchresponse = {
            success: false,
            message: "Bad request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response)
        mock.onGet(process.env.SEARCH_SERVICE + '/search/organizations/1/events').reply(400, searchresponse)

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.search(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(searchresponse);
    });

    test('Search network timeout', async () => {
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

        const searchresponse = {
            success: false,
            message: "Error when searching the event from the search service for the organization id 1. timeout of 0ms exceeded"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response)
        mock.onGet(process.env.SEARCH_SERVICE + '/search/organizations/1/events').timeout()

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.search(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(searchresponse);
    });

    test('Search network error', async () => {
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

        const searchresponse = {
            success: false,
            message: "Error when searching the event from the search service for the organization id 1. Network Error"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);
        mock.onGet(process.env.SEARCH_SERVICE + '/search/organizations/1/events').networkError();

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.search(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(searchresponse);
    });

    test('Search error 401', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const searchresponse = {
            success: false,
            message: "Bad request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse)
        mock.onGet(process.env.SEARCH_SERVICE + '/search/organizations/1/events').reply(401, orgresponse)
        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.search(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('GetEvent 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            type: "object",
            action: "add",
            source: "System 1 for Org 1",
            status: "accepted"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    
    test('GetEvent 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            type: "object",
            action: "add",
            source: "System 1 for Org 1",
            status: "accepted"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);
        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);
        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('GetEvent 500 timeout error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            success: false,
            message: "Error when fetching the event 0f49befb-84e2-45ef-b9ca-dc545787d960 from the database for the organization id 1. timeout of 0ms exceeded"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEvent 500 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            success: false,
            message: "Error returned when fetching the event 0f49befb-84e2-45ef-b9ca-dc545787d960 from the database for the organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get Processing queues count 200 Response', async () => {
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

        const eventresponse = {
            "queue": "event-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const masterdataresponse = {
            "queue": "masterdata-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataqueuecount';
        const mdurl = new RegExp(`${mdUri}/*`);
        mock.onGet(mdurl).reply(200, masterdataresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queueresponse);
    });

    test('Get Processing queues count 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = {
            "queue": "event-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const masterdataresponse = {
            "queue": "masterdata-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    
    test('Get Processing queues count 500 Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error returned when fetching count of messages in processing queues from the event and masterdata services for the organization id 1."
        }
        const masterdataresponse = {
            "queue": "masterdata-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataqueuecount';
        const mdurl = new RegExp(`${mdUri}/*`);
        mock.onGet(mdurl).reply(200, masterdataresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(2)
        expect(res.send.mock.calls.length).toBe(2);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    
    test('Get Processing queues count 500 Response', async () => {
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

        const eventresponse = {
            "queue": "event-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const masterdataresponse = {
            success: false,
            message: "Error returned when fetching count of messages in processing queues from the event and masterdata services for the organization id 1."
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataqueuecount';
        const mdurl = new RegExp(`${mdUri}/*`);
        mock.onGet(mdurl).reply(500, masterdataresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(2)
        expect(res.send.mock.calls.length).toBe(2);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('Get Processing queues count 500 timeout Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error when fetching count of messages in processing queues from the event and masterdata services for the organization id 1. timeout of 0ms exceeded"
        }
        const masterdataresponse = {
            "queue": "masterdata-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataqueuecount';
        const mdurl = new RegExp(`${mdUri}/*`);
        mock.onGet(mdurl).reply(200, masterdataresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(2)
        expect(res.send.mock.calls.length).toBe(2);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    
    test('Get Processing queues count 500 error timeout  Response', async () => {
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

        const eventresponse = {
            "queue": "event-processor-local",
            "messageCount": 0,
            "consumerCount": 0
        }
        const masterdataresponse = {

            success: false,
            message: "Error when fetching count of messages in processing queues from the event and masterdata services for the organization id 1. timeout of 0ms exceeded"
        }
        const queueresponse = {
            "eventQueue": {
                "queue": "event-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            },
            "masterdataQueue": {
                "queue": "masterdata-processor-local",
                "messageCount": 0,
                "consumerCount": 0
            }
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventqueuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataqueuecount';
        const mdurl = new RegExp(`${mdUri}/*`);
        mock.onGet(mdurl).timeout();

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getProcessingQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(2)
        expect(res.send.mock.calls.length).toBe(2);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('Get Deadletter queue count 200 Response', async () => {
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

        const eventresponse = {
            "queue": "event-processor-local-deadletter",
            "messageCount": 10,
            "consumerCount": 0
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventdlx/queuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getDeadLetterQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get Deadletter queue count 401 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = {
            "queue": "event-processor-local-deadletter",
            "messageCount": 10,
            "consumerCount": 0
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventdlx/queuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getDeadLetterQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });
    
    test('Get Deadletter queue count 500 error Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error returned when fetching count of failed messages in deadletter queue from the event service for the organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventdlx/queuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getDeadLetterQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get Deadletter queue count 500 timeout Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error when fetching count of failed messages in deadletter queues from the event service for the organization id 1. timeout of 0ms exceeded"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventdlx/queuecount';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getDeadLetterQueueCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Retry Deadletter  queue messages to processing queue 200 Response', async () => {
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

        const eventresponse = {
            "success": true,
            "message": "Success in retrying the failed event messages."
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventretry';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.retryEventsQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Retry Deadletter  queue messages to processing queue 401 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = {
            "success": true,
            "message": "Success in retrying the failed event messages."
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventretry';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.retryEventsQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    
    test('Retry Deadletter  queue messages to processing queue 500 error Response', async () => {
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

        const eventresponse = {
            "success": false,
            "message": "Error returned when retrying failed messages in deadletter queue from the event service for the organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventretry';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.retryEventsQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Retry Deadletter  queue messages to processing queue 500 timeout error Response', async () => {
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

        const eventresponse = {
            "success": false,
            "message": "Error when retrying failed messages in deadletter queues from the event service for the organization id 1. timeout of 0ms exceeded"
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventretry';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.retryEventsQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    
    test('Post event queue status to pause processing queue 200 Response', async () => {
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

        const request = {
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin"
        }
        const eventresponse = {
            "id": 12,
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onPost(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Post event queue status to pause processing queue 500 error Response', async () => {
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

        const request = {
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin"
        }
        const eventresponse = {
            success: false,
            message: "Error returned when setting the event queue status to pause/resume of processing queue from the event service for the organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onPost(url).reply(500, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Post event queue status to pause processing queue 500 timeout error Response', async () => {
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

        const request = {
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin"
        }
        const eventresponse = {
            success: false,
            message: "Error when setting the event queue status to pause/resume of processing queue from the event service for the organization id 1. timeout of 0ms exceeded"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onPost(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });


    test('Post event queue status to pause processing queue 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const request = {
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin"
        }
        const eventresponse = {
            "id": 12,
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/events/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onPost(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('Get processing queue status  200 Response', async () => {
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

        const eventresponse = {
            "id": 10,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get processing queue status  401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = {
            "id": 10,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('Get processing queue status  500 Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error returned when fetching the event processing queue status from the event service for the organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get processing queue status  500 timeout Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error when fetching the event processing queue status from the event service for the organization id 1. timeout of 0ms exceeded"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/queuestatus';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    
    test('Get distinct event sources  200 Response', async () => {
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

        const eventresponse = ["Source 1", "Source 2", "Source 3"];

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventssources';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventSourcesConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get distinct event sources  401 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = ["Source 1", "Source 2", "Source 3"];

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventssources';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventSourcesConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('Get distinct event sources  500 Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error returned when fetching distinct event sources from the database for the organization id 1."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventssources';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventSourcesConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get distinct event sources  500  timeout Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error when fetching distinct event sources from the database for the organization id 1. timeout of 0ms exceeded"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventssources';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventSourcesConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

      
    test('Get distinct event destinations  200 Response', async () => {
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

        const eventresponse = ["Destination 1", "Destination 2", "Destination 3"];

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventsdestinations';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(200, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get distinct event destinations  401 error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        const eventresponse = ["Destination 1", "Destination 2", "Destination 3"];

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventsdestinations';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(401, orgresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('Get distinct event destinations  500 Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error returned when fetching distinct event destinations from the database for the organization id 1."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventsdestinations';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).reply(500, eventresponse);


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Get distinct event destinations  500  timeout Response', async () => {
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

        const eventresponse = {
            success: false,
            message: "Error when fetching distinct event destinations from the database for the organization id 1. timeout of 0ms exceeded"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const eventUri = process.env.EVENT_SERVICE + '/organization/1/eventsdestinations';
        const url = new RegExp(`${eventUri}/*`);
        mock.onGet(url).timeout();


        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventDestinationsConfig(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });





    test('GetEventFromBlockchain 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.EVENT_SERVICE + '/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, eventresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEventFromBlockchain 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.EVENT_SERVICE + '/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });


    test('GetEventFromBlockchain 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            success: false,
            message: 'Error returned when fetching the master data 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.EVENT_SERVICE + '/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, eventresponse);

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEventFromBlockchain 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const eventresponse = {
            success: false,
            message: 'Error retrieving event from blockchain for event id 0f49befb-84e2-45ef-b9ca-dc545787d960 on blockchain blockchain-lab-adapter for org 1: Network Error'
        }

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, response);
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const url = process.env.EVENT_SERVICE + '/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        mock.onGet(url).networkError();

        let controller: AdministrationEventsController = new AdministrationEventsController();
        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
});