/*
 * EPCIS MESSAGING HUB - QUERY BFF

 */


import {ErrorService} from "../../src/services/error-service";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

describe("Check class \'ErrorService\' ", () => {

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            ALERT_SERVICE: "http://localhost:9999"
        };
    });

    test('reportError should return unknown error when bad error code is passed ', async () => {
        let msg = ErrorService.reportError(null, null, 6666, null, null);
        expect(msg).toEqual("Unknown error code: QRYX6666");
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