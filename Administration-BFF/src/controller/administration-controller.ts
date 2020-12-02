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
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

import express from "express";
import path from "path";
import {CommonUtils} from "../utils/common-utils";
import JwtDecode from 'jwt-decode';

let querystring = require('querystring');
let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         *
         * definitions:
         *  200Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: true
         *      message:
         *        type: string
         *        example: "Success"
         *  400Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "Missing or Invalid parameters/request body"
         *  401Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "Uses does not have permission to perform that task"
         *  403Response:
         *    type: string
         *    example: "RBAC: access denied"
         *  404Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "Not found"
         *  500Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "An error has occurred..."
         *  501Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "NOT IMPLEMENTED YET"
         */
    }

    /**
     * Gets the subject id from caller's the JWT token (aka access token)
     *
     * @param req - the incoming request
     * @private
     */
    public static getSubjectId(req: express.Request): string {
        // get the access_token from the header
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error("No authorization header received");
        }

        //decode the token to get the subjectid who is calling this API
        let bearer = "Bearer ";
        let accessToken = authHeader.substring(bearer.length);
        let decoded: any = JwtDecode(accessToken);
        let subjectid = decoded.sub;
        if (!subjectid || subjectid === '') {
            throw new Error("Can't determine subject id. No sub value in JWT");
        }

        return subjectid;
    }

    /**
     * Determines if a caller has an assigned role
     *
     * @param req
     * @param role
     * @private
     */
    public static subjectHasRole(req: express.Request, role: string): boolean {
        // get the access_token from the header
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error("No authorization header received");
        }

        //decode the token to get the roles for who is calling this API
        let bearer = "Bearer ";
        let accessToken = authHeader.substring(bearer.length);
        let decoded: any = JwtDecode(accessToken);

        let roles = decoded.roles;
        if (roles) {
            for (let i = 0; i < roles.length; i++) {
                if (role === roles[i]) {
                    return true;
                }
            }
        }
        return false;
    }
}