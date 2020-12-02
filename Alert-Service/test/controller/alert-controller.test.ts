import { Pool } from "pg";
import { AlertController } from '../../src/controller/alert-controller';
const { mockRequest, mockResponse } = require('../utils/interceptor');
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

jest.mock('../../src/utils/common-utils', () => {
    const mLogger = {
        error: jest.fn((message) => console.log(message)),
        warn: jest.fn((message) => console.log(message)),
        info: jest.fn((message) => console.log(message))
    }

    const mCommonUtils = {
        //mock this so it returns the same ID for each test
        generateID: jest.fn(() => {
            return "123345-12345-12345";
        }),
        log: jest.fn((path: any) => {
            return mLogger;
        }),
        decodeBase64: jest.fn((value: string) => {
            return "somevalue";
        })
    };
    return {
        CommonUtils: jest.fn(() => mCommonUtils)
    };
});

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return {
        Pool: jest.fn(() => mPool)
    };
});

describe("Check class \'AlertController\' ", () => {

    let pool: any;
    let controller: AlertController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            PGCERT: ""
        };
        pool = new Pool();
        controller = new AlertController();
    });


    test('create alert, should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            severity: "WARNING",
            source: "masterdata-service",
            errorCode: "MSDS1001",
            errorEngDesc: "XML doesn't comply with EPCIS standard.",
            errorMsg: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        }
        const res = mockResponse();
        const response = {
            "id": 5,
            "organization_id": 1,
            "timestamp": "2020-08-14T16:15:54.968Z",
            "severity": "WARNING",
            "source": "masterdata-service",
            "errorCode": "MSDS1001",
            "errorEngDesc": "XML doesn't comply with EPCIS standard.",
            "errorMsg": "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        };


        pool.query.mockResolvedValue({ rows: [response], rowCount: 1 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('create alert, should 400 when severity is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            source: "masterdata-service",
            errorCode: "MSDS1001",
            errorEngDesc: "XML doesn't comply with EPCIS standard.",
            errorMsg: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing severity in request"
        };


        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('create alert, should 400 when source is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            severity: "WARNING",
            errorCode: "MSDS1001",
            errorEngDesc: "XML doesn't comply with EPCIS standard.",
            errorMsg: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing source in request"
        };


        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('create alert, should 400 when errorCode is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            severity: "WARNING",
            source: "masterdata-service",
            errorEngDesc: "XML doesn't comply with EPCIS standard.",
            errorMsg: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing errorCode in request"
        };


        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('create alert, should 400 when errorEngDesc is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            severity: "WARNING",
            errorCode: "MSDS1001",
            source: "masterdata-service",
            errorMsg: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing errorEngDesc in request"
        };


        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });


    test('create alert, should 200 when errorMsg is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            severity: "WARNING",
            errorCode: "MSDS1001",
            source: "masterdata-service",
            errorEngDesc: "XML doesn't comply with EPCIS standard."
        }
        const res = mockResponse();
        const response = {
            "id": 6,
            "organization_id": 1,
            "timestamp": "2020-08-14T16:15:54.968Z",
            "severity": "WARNING",
            "source": "masterdata-service",
            "errorCode": "MSDS1001",
            "errorEngDesc": "XML doesn't comply with EPCIS standard.",
            "errorMsg": ""
        };


        pool.query.mockResolvedValue({ rows: [response], rowCount: 1 });
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });
    test('createalert should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            severity: "WARNING",
            errorCode: "MSDS1001",
            source: "masterdata-service",
            errorEngDesc: "XML doesn't comply with EPCIS standard."
        }
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't post new alert to database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.createAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getAlert should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.alertId = 3;
        const res = mockResponse();
        const queryResponse = [
            {
                "id": 3,
                "organization_id": 1,
                "timestamp": "2020-08-14T16:15:54.968Z",
                "severity": "WARNING",
                "source": "event-service",
                "errorCode": "EVTS1001",
                "errorEngDesc": "XML doesn't comply with EPCIS standard.",
                "errorMsg": "Error at line 20 with EPCISody which doesn't comply with EPCIS 1.2standard."
            }
        ];

        pool.query.mockResolvedValue({ rows: queryResponse, rowCount: queryResponse.length })
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse[0]);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAlert should 500 when db error', async () => {
        const req = mockRequest();
        req.params.alertId = 3;
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't retrieve alert details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getAlertsCountByOrganization should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const queryResponse = {
            errorsCount: 20,
            warningsCount: 40
        };

        pool.query.mockResolvedValueOnce({ rows: [{count: "20"}], rowCount: 1 })
                .mockResolvedValueOnce({rows: [{count: "40"}], rowCount: 1})
        await controller.getAlertsCountByOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAlertsCountByOrganization should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't retrieve alert details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getAlertsCountByOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('deleteAllAlertsForOrganization should 200 when all alerts are deleted', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const queryResponse = { success: true, message: "All alerts are cleared." }

        pool.query.mockResolvedValue({ rowCount: 1 })
        await controller.deleteAllAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteAllAlertsForOrganization should 404 when no alerts in db', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const queryResponse = { success: false, message: "no alerts found" }

        pool.query.mockResolvedValue({ rowCount: 0 })
        await controller.deleteAllAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    
    test('deleteAllAlertsForOrganization should 500 when bad query', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't clear alert(s) from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.deleteAllAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('deleteAlert should 200 when all alerts are deleted', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.alertId = 2;
        const res = mockResponse();
        const queryResponse = { success: true, message: "Alert is cleared." }

        pool.query.mockResolvedValue({ rowCount: 1 })
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteAlert should 404 when no alert in db', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.alertId = 7;
        const res = mockResponse();
        const queryResponse = { success: false, message: "no alert found" }

        pool.query.mockResolvedValue({ rowCount: 0 })
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    
    test('deleteAlert should 500 when bad query', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.alertId = 9;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't clear alert(s) from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.deleteAlert(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getAllAlertsForOrganization should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.pagenumber = 1;
        req.query.resultsperpage= 5;
        const res = mockResponse();
        const queryResponse = [
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
        const response = {
            currentPage: 1,
            results: queryResponse,
            resultsPerPage: 5,
            totalPages: 2,
            totalResults: 10
        };

        pool.query.mockResolvedValueOnce({ rows: queryResponse, rowCount: queryResponse.length })
                .mockResolvedValueOnce({ rows: [ {count: "10"} ], rowCount: 1 });
        await controller.getAllAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAllAlertsForOrganization should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const response= {
            success: false,
            message: "Couldn't retrieve alert details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getAllAlertsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});