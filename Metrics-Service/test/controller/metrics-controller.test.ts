import { Pool } from "pg";
import { MetricsController } from '../../src/controller/metrics-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import {ErrorService} from "../../src/services/error-service";
const { mockRequest, mockResponse } = require('../utils/interceptor');

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

describe("Check class \'MetricsController\' ", () => {

    let pool: any;
    let controller: MetricsController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            PGCERT: "",
            ALERT_SERVICE: "http://localhost:9999"
        };
        pool = new Pool();
        controller = new MetricsController();
    });

    test('getMessagesProcessed should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            eventMessages: 200,
            masterdataMessages: 300
        }

        pool.query.mockResolvedValueOnce({ rows: [{count: 200}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{count: 300}], rowCount: 1})
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMessagesProcessed should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getMessagesProcessed should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockResolvedValueOnce({ rows: [{count: 200}], rowCount: 1})
        .mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getMessagesProcessed(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventsByPeriod should 400 when duration is undefined in query param', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.duration = undefined;
        const res = mockResponse();
        const queryResponse = { "success": false, "message": "Missing duration in query of request" }

        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventsByPeriod should 200 when duration is past week', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.duration = "past week";
        const res = mockResponse();
        const response = [{ "date": "8/25/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/26/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/27/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/28/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/29/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/30/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/31/2020", "object": 100, "transaction": 100, "transformation": 340 }];

        pool.query.mockResolvedValueOnce({ rows: [{"date": "8/25/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/25/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/25/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/26/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/26/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/26/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/27/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/27/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/27/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/28/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/28/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/28/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/29/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/29/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/29/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/30/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/30/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/30/2020", "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/31/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/31/2020", "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"date": "8/31/2020", "count": 340}], rowCount: 1})

        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByPeriod should 200 when duration is past day', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.duration = "past day";
        const res = mockResponse();
        const response = [{ "hours": 0, "object": 0, "transaction": 0, "transformation": 0 }, { "hours": 4, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 8, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 12, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 16, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 20, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 24, "object": 100, "transaction": 100, "transformation": 340 }];

        pool.query.mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})

        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByPeriod should 200 when duration is past hour', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.duration = "past hour";
        const res = mockResponse();
        const response = [{ "minutes": 0, "object": 0, "transaction": 0, "transformation": 0 },{ "minutes": 10, "object": 100, "transaction": 100, "transformation": 340 }, { "minutes": 20, "object": 100, "transaction": 100, "transformation": 340 }, { "minutes": 30, "object": 100, "transaction": 100, "transformation": 340 }, { "minutes": 40, "object": 100, "transaction": 100, "transformation": 340 }, { "minutes": 50, "object": 100, "transaction": 100, "transformation": 340 }, { "minutes": 60, "object": 100, "transaction": 100, "transformation": 340 }];

        pool.query.mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 340}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{ "count": 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{"count": 340}], rowCount: 1})

        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByPeriod should 400 when duration is wrong', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.duration = "past year";
        const res = mockResponse();
        const queryResponse = { "success": false, "message": "Provide duration as either past week or past day or past hour in query of request" }

        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventsByPeriod should 500 when db error', async () => {
        const req = mockRequest();
        req.query.duration="past week";
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getEventsByPeriod(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventsByType should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = [{type: "object",count: 200}, {type: "transaction",count: 100}, {type: "transformation",count: 50}]

        pool.query.mockResolvedValueOnce({ rows: [{count: 200}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{count: 100}], rowCount: 1})
                .mockResolvedValueOnce({ rows: [{count: 50}], rowCount: 1})
        await controller.getEventsByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByType should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getEventsByType(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventsBySource should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = [{source: "source1", count: 27}, {source: "source2", count: 94}, {source: "source3", count: 160}];

        pool.query.mockResolvedValue({ rows: response, rowCount: response.length})
        await controller.getEventsBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsBySource should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getEventsBySource(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventsByDestination should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const request = [{destination_name: "destination1", count: 278}, {destination_name: "destination2", count: 394}, {destination_name: "destination3", count: 100}, {destination_name: null, count: 0}];
        const response = [{destination_name: "destination1", count: 278}, {destination_name: "destination2", count: 394}, {destination_name: "destination3", count: 100}];

        pool.query.mockResolvedValue({ rows: request, rowCount: request.length})
        await controller.getEventsByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByDestination should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getEventsByDestination(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventsByStatus should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = [{status: "on ledger", count: 498}, {status: "accepted", count: 334}, {status: "failed", count: 500}];

        pool.query.mockResolvedValue({ rows: response, rowCount: response.length})
        await controller.getEventsByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventsByStatus should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        let mock = new MockAdapter(axios);
        const queryResponse= {
            success: false,
            message: "Couldn't retrieve metrics details from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getEventsByStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(queryResponse);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('reportError should send alert when valid data is passed', async () => {
        let msg = ErrorService.reportError(1, null, 9900, null, null);

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {success: true});

        expect(msg).toEqual("UNIT TEST ERROR");
    });

    test('reportError should report error when alert service is unavailable', async () => {
        let msg = ErrorService.reportError(1, null, 9900, null, null);

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ALERT_SERVICE + '/organization/1/alerts').timeout();

        expect(msg).toEqual("UNIT TEST ERROR");
    });

});