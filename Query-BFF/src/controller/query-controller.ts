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
 * EPCIS MESSAGING HUB - QUERY BFF

 */

import express from "express";
import axios from "axios";
import JwtDecode from 'jwt-decode';
import {ErrorService} from "../services/error-service";


/**
 * This is the main controller for the Query BFF service.
 * It exposes OAUTH2-permissioned API endpoints for managing EPCIS query payloads
 */
export class QueryController {

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
         *  200StatusWithCallback:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: true
         *      message:
         *        type: string
         *        example: "Accepted"
         *      callbackURI:
         *        type: string
         *        example: "https://example.com/queries/12345/status"
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
         *        example: "Not authorized to perform that action"
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
         *        example: "Specified object not found"
         *  413Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "Request payload is too large. It exceeds the maximum of 1 MB."
         *  EPCISDocument:
         *    type: object
         *    properties:
         *      EPCISBody:
         *        type: object
         *        properties:
         *          epcisq:Poll:
         *            type: object
         *  EPCISResponseDocument:
         *    type: object
         *    properties:
         *      EPCISBody:
         *        type: object
         *        properties:
         *          epcisq:QueryResults:
         *            type: object
         *            properties:
         *              queryName:
         *                type: string
         *              EventList:
         *                type: object
         */

        /**
         * @swagger
         *
         *  '/queries':
         *    post:
         *      tags:
         *        - "Query API"
         *      summary: "Provides a new query to the hub"
         *      requestBody:
         *        content:
         *          application/xml:
         *            schema:
         *              $ref: '#/definitions/EPCISDocument'
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/xml:
         *                schema:
         *                  $ref: '#/definitions/EPCISResponseDocument'
         *        400:
         *          description: "Bad Request - Invalid XML"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        403:
         *          description: "Valid JWT Bearer token required in Authentication header"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/403Response'
         *        413:
         *          description: "Request too large"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/413Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.post("/", this.postQuery);
    }

    /**
     * Posts new queries by calling the query service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    postQuery = async (req: express.Request, res: express.Response): Promise<boolean> => {

        var clientId:any ;
        try {
            clientId = this.getClientId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 1000, e.stack, e.message );
            res.status(401).send({"success": false, "message": msg});
            return false;
        }

        try {
            const options = {
                headers: {
                    'Content-Type': 'application/xml'
                }
            };

            //call the query service by name, passing the request body.
            //If configured correctly Istio will use service discovery to locate the
            //correct service to call.
            const serviceEndpoint = process.env.QUERY_SERVICE + "/client/" + clientId + "/queries";

            await axios.post(serviceEndpoint, req.body, options)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, clientId, 4001, error.stack, [clientId, JSON.stringify(error.response.data)] );
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, clientId, 4002, error.stack, [clientId, error.message] )
                            res.status(500).send({"success": false, "message": msg});
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 9000, e.stack, [clientId, e.message] )
            res.status(500).send({"success": false, "message": msg});
        }
        return true;
    }

    /**
     * Gets the client id from caller's JWT token (aka access token)
     *
     * @param req - the incoming request
     * @private
     */
    private getClientId(req: express.Request): string {
        // get the access_token from the header
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error("No authorization header received");
        }

        //decode the token to get the tenant id
        let bearer = "Bearer ";
        let accessToken = authHeader.substring(bearer.length);
        let decoded: any = JwtDecode(accessToken);
        let clientId = decoded.sub;
        if (!clientId || clientId === '') {
            throw new Error("Can't determine client_id. No sub value in JWT");
        }
        return clientId;
    }
}