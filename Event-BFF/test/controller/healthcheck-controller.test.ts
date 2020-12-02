/*
 * EPCIS MESSAGING HUB - EVENT BFF

 */

import {HealthCheckController} from '../../src/controller/healthcheck-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter'

const {mockRequest, mockResponse} = require('../utils/interceptor')

describe("Check class \'HealthCheckController\' ", () => {
    test('service and all dependencies are up', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"status": "UP"}

        mock.onGet(process.env.EVENT_SERVICE + '/health').reply(200, response)

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "UP",
            "components": [{"event-service": {"status": "UP"}}]
        });
    });

    test('one or more service dependencies are down', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        const downresponse = {"status": "DOWN"}

        mock.onGet(process.env.EVENT_SERVICE + '/health').reply(503, downresponse)

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "DOWN",
            "components": [{"event-service": {"status": "DOWN"}}]
        });
    });

    test('network error. no connection to service dependencies', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.EVENT_SERVICE + '/health').timeout()

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "DOWN",
            "components": [{"event-service": {"status": "ECONNABORTED"}}]
        });
    });

    test('catch method error', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.EVENT_SERVICE + '/health').networkError();

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({"status": "UNKNOWN"});
    });

});