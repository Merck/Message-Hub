/*
 * Copyright 2020 Merck Sharp & Dohme Corp. a subsidiary of Merck & Co.,
 * Inc., Kenilworth, NJ, USA.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * EPCIS MESSAGING HUB - ORGANIZATION SERVICE

 */

import {configure, getLogger, Logger} from "log4js";
import path from "path";

/**
 * Configuration of Log4js
 */
configure({
    appenders: {
        file: {type: 'file', filename: 'error.log', layout: {type: 'pattern', pattern: '[%d] [%p] [%z] %c %l: %m'}},
        out: {type: 'console', layout: {type: 'pattern', pattern: '%[[%d] [%p] [%z] %c %l%]: %m'}}
    },
    categories: {
        default: {appenders: ['out', 'file'], enableCallStack: true, level: 'debug'}
    }
});

/**
 * This class provides utility methods used by multiple classes in this service
 */
export class CommonUtils {

    /**
     * Returns a Log4JS logger
     *
     * @param currentFile - the name of the class file to be show in the logs
     */
    public log = (currentFile?: string | undefined): Logger => {
        let logger = getLogger((currentFile !== undefined) ? `[ ${currentFile} ]` : `[ ${path.basename(__filename)} ]`);
        logger.level = 'ALL';
        return logger;
    };

    /**
     * @description **decodeBase64** method is a public method to quickly decode a BASE64 string
     * @param encodedText {string} A BASE64 encoded string as an argument
     * @return Decoded plain text string
     */
    public decodeBase64 = (encodedText: string): string => {
        return Buffer.from(encodedText, 'base64').toString();
    };
}