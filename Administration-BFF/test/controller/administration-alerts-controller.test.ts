/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import { AdministrationAlertsController } from '../../src/controller/administration-alerts-controller';
import axios from "axios";

import MockAdapter from 'axios-mock-adapter';

const { mockRequest, mockResponse } = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDUzMzQ2LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6IjRkOThkMGE2LWI3M2QtNDE1YS04NWM3LWUwOTdkNjhlNjg2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA0OTc0NiwidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOlsib3JnYW5pemF0aW9uX2FkbWluIiwiaHViX2FkbWluIl19.WzbFCkk-X0LIyb51Z-Ov-RpDl_dSkhjq_BDtlGA0ePo8oQWG0Y_qyfmPE4rC3QvlvUXEqupRdFpPRQaD8PCGUKMIYfZvxdbxWh_eLCi_awt8JYbKyUJ22y4FhGKY9sVYGinblJJqzFnkJR4DAT-JX_eBCDBHZXCkjXG1JpaUKZvpEsuhyZFgH_-BlwL4ymD0NvAaF6GLnEBIG1tpvr2qzK_kDYFB-ExPYArS9qyXjEhAaVNitnqAU_zDYaCEgJ-meGZiFdS-wuwQ0HOINfoDiLUwHGJIOhc1AYbTmhqAvboxLEH99GDm-uFPeOw91km3R3RWEC2kJWgz6xVjzFgUxA";

describe("Check \'AdministrationAlertsController\' ", () => {
    test('Get all alerts 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.query.pagenumber = 1;
        req.query.resultsperpage = 5;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse = [
            {
                "id": 1,
                "organization_id": 1,
                "timestamp": "2020-08-14T16:15:54.968Z",
                "severity": "WARNING",
                "source": "masterdata-service",
                "errorCode": "MSDS1001",
                "errorEngDesc": "XML doesn't comply with EPCIS standard.",
                "errorMsg": "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
            },
            {
                "id": 2,
                "organization_id": 1,
                "timestamp": "2020-08-15T16:15:54.968Z",
                "severity": "WARNING",
                "source": "masterdata-service",
                "errorCode": "MSDS1002",
                "errorEngDesc": "Parsing XML error.",
                "errorMsg": "Error at line 10 with EPCISBody > is missing."
            },
            {
                "id": 3,
                "organization_id": 1,
                "timestamp": "2020-08-14T16:15:54.968Z",
                "severity": "WARNING",
                "source": "event-service",
                "errorCode": "EVTS1001",
                "errorEngDesc": "XML doesn't comply with EPCIS standard.",
                "errorMsg": "Error at line 20 with EPCISody which doesn't comply with EPCIS 1.2standard."
            },
            {
                "id": 4,
                "organization_id": 1,
                "timestamp": "2020-08-15T16:15:54.968Z",
                "severity": "WARNING",
                "source": "event-service",
                "errorCode": "EVTS1000",
                "errorEngDesc": "parsing XML error.",
                "errorMsg": "Error at line 10 with EPCIBody > is missing"
            },
            {
                "id": 5,
                "organization_id": 1,
                "timestamp": "2020-08-17T16:15:54.968Z",
                "severity": "ERROR",
                "source": "masterdata-service",
                "errorCode": "MSDS4001",
                "errorEngDesc": "Data privacy rules failed .",
                "errorMsg": "404 Error in connecting to data privacy rules service"
            }
        ]
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('GetAll alerts 500 Error Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Couldn't retrieve alert details from database."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('GetAll alerts 500 Error timeout Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Error when fetching all alerts from the database for the organization id 1. timeout of 0ms exceeded"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).timeout();

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('GetAll alerts Error Response 401', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse)
        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);
        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });


    test('Get alert 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse ={
                "id": 1,
                "organization_id": 1,
                "timestamp": "2020-08-14T16:15:54.968Z",
                "severity": "WARNING",
                "source": "masterdata-service",
                "errorCode": "MSDS1001",
                "errorEngDesc": "XML doesn't comply with EPCIS standard.",
                "errorMsg": "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
            };
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get alert 500 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse= {
            success: false,
            message: "Error returned when fetching the alert 1 from the database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Get alert 500 Error timeout Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse= {
            success: false,
            message: "Error when fetching the alert 1 from the database for the organization id 1. timeout of 0ms exceeded"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).timeout();

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get alert 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 1;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    
    test('Get alerts count 200 Response', async () => {
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
        const dprResponse ={
            errorsCount: 20,
            warningsCount: 40
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alertscount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(200, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsCountForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get alerts count 500 Error Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Error returned when fetching alerts count from the database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alertscount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(500, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsCountForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get alerts count 500 Error timeout Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Error when fetching alerts count from the database for the organization id 1. timeout of 0ms exceeded"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alertscount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).timeout();

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsCountForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('Get alerts count 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}
        const dprResponse= {
            success: false,
            message: "Error returned when fetching alerts count from the database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alertscount';
        const url = new RegExp(`${mdUri}/*`);
        mock.onGet(url).reply(401, orgresponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.getAlertsCountForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });

    test('delete all alerts count 200 Response', async () => {
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
        const dprResponse ={ success: true, message: "All alerts are cleared." }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(200, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAllAlerts(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('DeleteAll alerts 500 Error Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Couldn't clear alert(s) from database."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(500, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAllAlerts(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('DeleteAll alerts 500 Error Response', async () => {
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
        const dprResponse= {
            success: false,
            message: "Error when clearing all from the database for the organization id 1. timeout of 0ms exceeded"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).timeout()

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAllAlerts(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('DeleteAll alerts 401 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}
        const dprResponse= {
            success: false,
            message: "Error returned when clearing all from the database for the organization id 1."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(401, orgresponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAllAlerts(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });
    
    test('delete  alert count 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse ={ success: true, message: "Alert is cleared." }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(200, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    
    test('Delete alert 500 Error Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 4;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse= {
            success: false,
            message: "Couldn't clear alert(s) from database."
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(500, dprResponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

        
    test('Delete alert 500 Error timeout Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 4;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {
            organization_id: 1,
            organization_name: "Test Org",
            username: "test@test.org",
            subject_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        }
        const dprResponse= {
            success: false,
            message: "Error when clearing the alert 4 from the database for the organization id 1. timeout of 0ms exceeded"
        }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(200, response);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).timeout();

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith(dprResponse);
    });

    test('delete  alert count 401 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.alertId = 2;
        let res = mockResponse();

        let mock = new MockAdapter(axios);
        const orgresponse = {"success": false, "message": "Error getting organization id from request token."}
        const dprResponse ={ success: true, message: "Alert is cleared." }
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations').reply(401, orgresponse);

        const mdUri = process.env.ALERT_SERVICE + '/organization/1/alerts/';
        const url = new RegExp(`${mdUri}/*`);
        mock.onDelete(url).reply(401, orgresponse);

        let controller: AdministrationAlertsController = new AdministrationAlertsController();
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgresponse);
    });
});