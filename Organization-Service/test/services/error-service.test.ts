/*
 * EPCIS MESSAGING HUB - ORGANIZATION SERVICE

 */


import {ErrorService} from "../../src/services/error-service";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

describe("Check class \'ErrorService\' ", () => {

    test('reportError should return unknown error when bad error code is passed ', async () => {
        let msg = ErrorService.reportError(null, null, 6666, null, null);
        expect(msg).toEqual("Unknown error code: ORGS6666");
    });

    test('reportError should return error when valid data is passed', async () => {
        let msg = ErrorService.reportError(1, "12345-12345-12345", 4007, null, [1, "12345-12345-12345"]);
        expect(msg).toEqual("Couldn't retrieve organization user with org id 1 and subject id 12345-12345-12345 from the database");
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