/*
 * EPCIS MESSAGING HUB - QUERY BFF

 */

const {mockRequest, mockResponse} = require('../utils/interceptor')
import {SwaggerController} from '../../src/controller/swagger-controller';

describe("Check class \'SwaggerController\' ", () => {
    test('should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        const spec = {
            "openapi": "3.0.0",
            "info": {"title": "Messaging Hub Authentication BFF", "version": "1.0.0"},
            "paths": {},
            "components": {},
            "tags": []
        }
        let controller: SwaggerController = new SwaggerController(spec);
        await controller.returnSpec(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(spec);
    });
});
