/*
 * EPCIS MESSAGING HUB - SEARCH SERVICE

 */

const {mockRequest, mockResponse} = require('../utils/interceptor')
import {HealthCheckController} from '../../src/controller/healthcheck-controller';

describe("Check class \'HealthCheckController\' ", () => {
    test('should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let controller: HealthCheckController = new HealthCheckController();
        await controller.getHealth(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({"status": "UP"});
    });
});