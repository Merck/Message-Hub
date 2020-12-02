/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {AdministrationMasterdataController} from '../../src/controller/administration-masterdata-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationMasterdataController\' ", () => {

    beforeAll(() => {
        //these values don't matter, they just have to be set
        process.env = {
            PGCERT: "",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            ALERT_SERVICE: "http://localhost:9003",
            MASTERDATA_SERVICE: "http://localhost:8089"
        };
    });

    test('GetMasterData 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            source: "System 1 for Org 1",
            status: "accepted",
            xml_data: "xml data",
            json_data: "json data"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });
    test('GetMasterData 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    
    test('GetMasterData 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            success: false,
            message: 'Error returned when fetching the master data 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterData 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            success: false,
            message: 'Error when fetching the master data 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1. Network Error'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetAllMasterData 200 Response', async () => {
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

        const masterdataresponse = [{
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            source: "System 1 for Org 1",
            status: "accepted",
            xml_data: "xml data",
            json_data: "json data"
        }, {
            id: "uf49bwfb-84e2-452f-b9ca-oc545787d960",
            timestamp: "2020-08-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            source: "System 1 for Org 1",
            status: "accepted",
            xml_data: "xml data",
            json_data: "json data"
        }];

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetAllMasterData 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    
    test('GetAllMasterData 500 Response', async () => {
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

        const masterdataresponse = {
            success: false,
            message: 'Error returned when fetching all master data from database for organization id 1.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetAllMasterData 500 network error Response', async () => {
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

        const masterdataresponse = {
            success: false,
            message: 'Error when fetching all master data from database for organization id 1. Network Error'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('delete MasterData 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            "success": true,
            "message": "master data is deleted"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(200, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.deleteMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });
    

    test('delete MasterData 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {"success": false, "message": "Error getting organization id from request token."}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, masterdataresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(401, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.deleteMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('delete MasterData 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            "success": false,
            "message": "Error returned when deleting the masterdata 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(500, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.deleteMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('delete MasterData 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdata_id = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            "success": false,
            "message": "Error when deleting the masterdata 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1. Network Error"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).networkError();

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.deleteMasterDataById(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
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

        const mdresponse = {
            "queue": "masterdata-processor-local-deadletter",
            "messageCount": 10,
            "consumerCount": 0
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdatadlx/queuecount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Get Deadletter queue count 500 Response', async () => {
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

        const mdresponse = {
            success: false,
            message: 'Error returned when fetching the count of failed masterdata messages in deadletter queue from RabbitMQ for organization id 1.'
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdatadlx/queuecount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Get Deadletter queue count 500 network error Response', async () => {
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

        const mdresponse = {
            success: false,
            message: 'Error when fetching the count of failed masterdata messages in deadletter queue from RabbitMQ for organization id 1. Network Error'
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdatadlx/queuecount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Get Deadletter queue count 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const mdresponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, mdresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdatadlx/queuecount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });
    test('Retry Deadletter queue messages to processing queue 200 Response', async () => {
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

        const mdresponse = {
            "success": true,
            "message": "Success in retrying the failed masterdata messages."
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataretry';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Retry Deadletter queue messages to processing queue 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const mdresponse = {
            "success": true,
            "message": "Error getting organization id from request token."
        }


        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, mdresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataretry';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });
    
    test('Retry Deadletter queue messages to processing queue 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const mdresponse = {
            "success": false,
            "message": "Error returned when retrying the failed masterdata messages in deadletter queue from RabbitMQ for organization id 1."
        }
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataretry';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, mdresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Retry Deadletter queue messages to processing queue 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const mdresponse = {
            "success": false,
            "message": "Error when retrying the failed masterdata messages in deadletter queue from RabbitMQ for organization id 1. Network Error"
        }
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdataretry';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).networkError();

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(mdresponse);
    });

    test('Post masterdata queue status to pause processing queue 200 Response', async () => {
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
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const eventresponse = {
            "id": 5,
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/queuestatus';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(200, eventresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Post masterdata queue status to pause processing queue 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const request = {
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const eventresponse = {
            success: false,
            message: 'Error getting organization id from request token.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, eventresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/queuestatus';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(401, eventresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Post masterdata queue status to pause processing queue 500 Response', async () => {
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
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const eventresponse = {
            success: false,
            message: 'Error returned when setting the masterdata queue status to pause/resume of processing queue from the masterdata service for the organization id 1.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/queuestatus';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).reply(500, eventresponse);


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('Post masterdata queue status to pause processing queue 500 network error Response', async () => {
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
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const eventresponse = {
            success: false,
            message: 'Error when setting the masterdata queue status to pause/resume of processing queue from the masterdata service for the organization id 1. Network Error'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/queuestatus';
        const url = new RegExp(`${mdUri}/*`);
        mock.onPost(url).networkError();


        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });



    test('GetMasterdataFromBlockchain 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterdataFromBlockchain 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });


    test('GetMasterdataFromBlockchain 500 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            success: false,
            message: 'Error returned when fetching the master data 0f49befb-84e2-45ef-b9ca-dc545787d960 from database for organization id 1.'
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, masterdataresponse);

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterdataFromBlockchain 500 network error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }

        const masterdataresponse = {
            success: false,
            message: 'Error retrieving masterdata from blockchain for masterdata id 0f49befb-84e2-45ef-b9ca-dc545787d960 on blockchain blockchain-lab-adapter for org 1: Network Error'
        }

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, response);
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const url = process.env.MASTERDATA_SERVICE + '/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960/blockchain/blockchain-lab-adapter';
        mock.onGet(url).networkError();

        let controller: AdministrationMasterdataController = new AdministrationMasterdataController();
        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });
});