/*
 * EPCIS MESSAGING HUB - DIGITAL FINGERPRINT BLOCKCHAIN ADAPTER

 */

import path from "path";
import {CommonUtils} from '../../src/utils/common-utils';

describe("Check class \'CommonUtils\' ", () => {
    test('Get logger with filename', () => {
        let commonUtils = new CommonUtils();
        let logger = commonUtils.log(path.basename(__filename));
        expect(logger);
    });

    test('Get logger without filename', () => {
        let commonUtils = new CommonUtils();
        let logger = commonUtils.log();
        expect(logger);
    });

    test('Decode Base 64', () => {
        let commonUtils = new CommonUtils();
        let decoded = commonUtils.decodeBase64("dGhpcyBpcyBhIHRlc3Q=");
        expect(decoded);
    });

    test('Generate ID', () => {
        let commonUtils = new CommonUtils();
        let uuid = commonUtils.generateID();
        expect(uuid);
    });
});