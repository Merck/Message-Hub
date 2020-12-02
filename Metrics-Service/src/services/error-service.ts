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
 * EPCIS MESSAGING HUB - METRICS SERVICE

 */

import axios from "axios";
import path from "path";
import {CommonUtils} from "../utils/common-utils";
import * as errorCodes from '../config/errors.json';

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));
let jp = require('jsonpath');


export class ErrorService {

    private static PREFIX = 'METS';
    private static SOURCE = 'metrics-service';

    /**
     * Finds the error configuration based on the error code
     *
     * @param errorCode  - the 4 digit error code
     * @private
     */
    private static lookupError(errorCode: number): any {
        //use JSON Path to find the error
        let path = '$..[?(@.code==' + errorCode + ')]';
        let error = jp.value(errorCodes, path);

        //if it doesn't exist, then report that too.
        if (!error) {
            error = {
                code: 9999,
                description: "Unknown error code: " + this.PREFIX + errorCode,
                severity: "ERROR",
                alertable: false
            }
        }
        return error;
    }

    /**
     * Formats the error log message
     *
     * @param orgId
     * @param clientId
     * @param errorCode
     * @param errorDescription
     * @param stack
     * @private
     */
    private static constructFormattedErrorMessage(orgId: any, clientId: any, errorCode: number, errorDescription: string, stack: any): string {

        let msg = "|" + this.PREFIX + errorCode + "|";
        if (orgId) {
            msg = msg + "ORG" + orgId + "|";
        }
        if (clientId) {
            msg = msg + "CLIENT" + clientId + "|";
        }
        msg = msg + errorDescription;
        if (stack) {
            msg = msg + "  " + stack
        }
        return msg;
    }

    /**
     * Generates a properly formatted log message, writes to the log, creates an alert if needed
     *
     * @param orgId
     * @param clientId
     * @param errorCode
     * @param stack
     * @param messageParams
     */
    public static reportError(orgId: any, clientId: any, errorCode: number, stack: any, messageParams: any): string {
        //lookup the error
        let error = this.lookupError(errorCode);

        //include any params in the error description
        let errorDescription = error.description;
        if( messageParams !== undefined && Array.isArray(messageParams) && messageParams.length > 0 ){
            for( let i = 0; i < messageParams.length; i++ ){
                errorDescription = errorDescription.replace('%s', messageParams[i]);
            }
        }else if( messageParams !== undefined ){
            errorDescription = errorDescription.replace('%s', messageParams);
        }

        //create the formatted error log message
        const errorMessage = this.constructFormattedErrorMessage(orgId, clientId, error.code, errorDescription, stack);

        //write it to the log file using the proper severity
        if ("ERROR" === error.severity) {
            logger.error(errorMessage)
        } else if ("WARNING" === error.severity) {
            logger.warn(errorMessage)
        } else {
            logger.info(errorMessage)
        }

        //if it is an alertable error, send it to the alert service to display in the Hub UI
        if (orgId && error.alertable) {
            this.createAlert(orgId, error.severity, this.SOURCE, this.PREFIX + error.code, errorDescription, stack);
        }
        // return the cleaned up error description
        return errorDescription;
    }


    /**
     * Sends a new alert to the alert service
     *
     * @param orgId
     * @param severity
     * @param source
     * @param errorCode
     * @param errorEngDesc
     * @param errorMsg
     */
    private static createAlert = async (orgId: number, severity: string, source: string, errorCode: string, errorEngDesc: string, errorMsg: any): Promise<void> => {
        try {
            let body = {
                severity: severity,
                source: source,
                errorCode: errorCode,
                errorEngDesc: errorEngDesc,
                errorMsg: errorMsg
            };

            //call the alert service
            await axios.post(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alerts', body);
        } catch (e) {
            ErrorService.reportError(orgId, null, 4000, e.stack, null);
        }
    }
}