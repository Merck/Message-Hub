/*
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

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
});