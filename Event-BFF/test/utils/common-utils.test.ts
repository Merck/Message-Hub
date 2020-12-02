/*
 * EPCIS MESSAGING HUB - EVENT BFF

 */

import path from "path";
import {CommonUtils} from '../../src/utils/common-utils';

describe("Check class \'CommonUtils\' ", () => {
    test('log', () => {
        let commonUtils = new CommonUtils();
        let logger = commonUtils.log(path.basename(__filename));
        expect(logger);
    });
});