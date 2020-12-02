/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import {HealthCheckController} from '../../src/controller/healthcheck-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter'


const {mockRequest, mockResponse} = require('../utils/interceptor')

describe("Check class \'HealthCheckController\' ", () => {

    beforeEach(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if( !process.env.ADMIN_BFF){
            process.env = {
                ADMIN_BFF: "http://localhost:8080",
                AUTH_BFF: "http://localhost:8080",
                EVENT_SERVICE: "http://localhost:8080",
                EVENT_BFF:"http://localhost:8080",
                ORGANIZATION_SERVICE: "http://localhost:8080",
                SEARCH_SERVICE: "http://localhost:8080",
                ROUTING_RULES_SERVICE: "http://localhost:8080",
                DATA_PRIVACY_RULES_SERVICE: "http://localhost:8080",
                MASTERDATA_SERVICE: "http://localhost:8080",
                METRICS_SERVICE: "http://localhost:8080",
                ALERT_SERVICE: "http://localhost:8080",
                MOCK_ADAPTER_SERVICE: "http://localhost:8080",
                MOCK_ADAPTER_2_SERVICE: "http://localhost:8080",
                MASTERDATA_BFF: "http://localhost:8080",
            };
        }
    });

    test('service and all dependencies are up', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        const response = {"status": "UP"}

        mock.onGet(process.env.EVENT_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.SEARCH_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.ROUTING_RULES_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.MASTERDATA_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.METRICS_SERVICE + '/health').reply(200, response)
        mock.onGet(process.env.ALERT_SERVICE + '/health').reply(200, response)

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "UP",
            "components": [{"service_name": "organization-service", "status": "UP"}, {"service_name": "event-service", "status": "UP"},
                {"service_name": "search-service", "status": "UP"}, {"service_name": "routing-rules-service", "status": "UP"},
                {"service_name": "data-privacy-rules-service", "status": "UP"}, {"service_name": "masterdata-service", "status": "UP"},
                {"service_name": "metrics-service", "status": "UP"}, {"service_name": "alert-service", "status": "UP"}]
        });
    });

    test('one or more service dependencies are down', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        const downresponse = {"status": "DOWN"}

        mock.onGet(process.env.EVENT_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.SEARCH_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.ROUTING_RULES_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.MASTERDATA_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.METRICS_SERVICE + '/health').reply(503, downresponse)
        mock.onGet(process.env.ALERT_SERVICE + '/health').reply(503, downresponse)

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "DOWN",
            "components": [{"service_name": "organization-service", "status": "DOWN"}, {"service_name": "event-service", "status": "DOWN"},
                {"service_name": "search-service", "status": "DOWN"}, {"service_name": "routing-rules-service", "status": "DOWN"},
                {"service_name": "data-privacy-rules-service", "status": "DOWN"}, {"service_name": "masterdata-service", "status": "DOWN"},
                {"service_name": "metrics-service", "status": "DOWN"}, {"service_name": "alert-service", "status": "DOWN"}]
        });
    });

    test('network error. no connection to service dependencies', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.EVENT_SERVICE + '/health').timeout()
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/health').timeout()
        mock.onGet(process.env.SEARCH_SERVICE + '/health').timeout()
        mock.onGet(process.env.ROUTING_RULES_SERVICE + '/health').timeout()
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + '/health').timeout()
        mock.onGet(process.env.MASTERDATA_SERVICE + '/health').timeout()
        mock.onGet(process.env.METRICS_SERVICE + '/health').timeout()
        mock.onGet(process.env.ALERT_SERVICE + '/health').timeout()

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "DOWN",
            "components": [{"service_name": "organization-service", "status": "ECONNABORTED"}, {"service_name": "event-service", "status": "ECONNABORTED"},
                {"service_name": "search-service", "status": "ECONNABORTED"}, {"service_name": "routing-rules-service", "status": "ECONNABORTED"},
                {"service_name": "data-privacy-rules-service", "status": "ECONNABORTED"}, {"service_name": "masterdata-service", "status": "ECONNABORTED"},
                {"service_name": "metrics-service", "status": "ECONNABORTED"}, {"service_name": "alert-service", "status": "ECONNABORTED"}]
        });
    });

    test('catch method error', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.EVENT_SERVICE + '/health').networkError();
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/health').networkError();
        mock.onGet(process.env.SEARCH_SERVICE + '/health').networkError();
        mock.onGet(process.env.ROUTING_RULES_SERVICE + '/health').networkError();
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + '/health').networkError();
        mock.onGet(process.env.MASTERDATA_SERVICE + '/health').networkError();
        mock.onGet(process.env.METRICS_SERVICE + '/health').networkError();
        mock.onGet(process.env.ALERT_SERVICE + '/health').networkError();
        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({
            "status": "DOWN",
            "components": [{"service_name": "organization-service", "status": "UNKNOWN"}, {"service_name": "event-service", "status": "UNKNOWN"},
                {"service_name": "search-service", "status": "UNKNOWN"}, {"service_name": "routing-rules-service", "status": "UNKNOWN"},
                {"service_name": "data-privacy-rules-service", "status": "UNKNOWN"}, {"service_name": "masterdata-service", "status": "UNKNOWN"},
                {"service_name": "metrics-service", "status": "UNKNOWN"}, {"service_name": "alert-service", "status": "UNKNOWN"}]
        });
    });

});