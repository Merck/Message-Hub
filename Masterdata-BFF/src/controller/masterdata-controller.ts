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
 * EPCIS MESSAGING HUB - MASTERDATA BFF

 */

import express from "express";
import path from "path";
import axios from "axios";
import {CommonUtils} from "../utils/common-utils";
import JwtDecode from 'jwt-decode';
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the MasterData BFF service.
 * It exposes OAUTH2-permissioned API endpoints for managing EPCIS masterdata payloads
 */
export class MasterDataController {

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
         *        example: "https://example.com/masterdata/12345/status"
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
         *  500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
         *  MasterdataDestination:
         *    type: object
         *    properties:
         *      destination_name:
         *        type: string
         *        example: "Mock Adapter"
         *      status:
         *        type: string
         *        example: "on_ledger"
         *      timestamp:
         *        type: string
         *        example: "2020-08-14T16:16:10.099Z"
         *      blockchain_response:
         *        type: string
         *        example: "Got it thanks"
         *  MasterdataMetadata:
         *    type: object
         *    properties:
         *      id:
         *        type: string
         *        description: "The unique identifier for the Masterdata as assigned by the Messaging Hub"
         *        example: "123e4567-e89b-12d3-a456-426614174000"
         *      timestamp:
         *        type: string
         *        description: "The Masterdata timestamp obtained from the submitted XML payload (not the system time)"
         *        example: "2014-04-01 15:19:49.31146+05:30"
         *      client_id:
         *        type: string
         *        description: "The client_id from the client credentials that called the Masterdatas API and posted the XML"
         *        example: "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc"
         *      organization_id:
         *        type: number
         *        description: "The organization id that owns the client_id"
         *        example: 3
         *      source:
         *        type: string
         *        example: "ATTP"
         *      status:
         *        type: string
         *        example: "on_ledger"
         *      xml_data:
         *        type: string
         *        example: '<epcismd:EPCISMasterDataDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1"schemaVersion="1.2" creationDate="2012-03-29T17:10:16Z"><EPCISBody>...</EPCISBody></epcismd:EPCISMasterDataDocument>'
         *      json_data:
         *        type: string
         *        example: "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{}}}"
         *      destinations:
         *        type: array
         *        items:
         *          $ref: '#/definitions/MasterdataDestination'
         *  AllMasterdata:
         *        type: array
         *        items:
         *          $ref: '#/definitions/MasterdataMetadata'
         *        description: "All Master Data for an organization"
         *  MasterdataStatus:
         *    type: object
         *    properties:
         *      status:
         *        type: string
         *        example: "on_ledger"
         *  EPCISMasterDataDocument:
         *    type: object
         *    properties:
         *      EPCISBody:
         *        type: object
         *        properties:
         *          VocabularyList:
         *            type: object
         */

        /**
         * @swagger
         *
         *  '/masterdata':
         *    post:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Provides a new master data to the hub"
         *      requestBody:
         *        content:
         *          application/xml:
         *            schema:
         *              $ref: '#/definitions/EPCISMasterDataDocument'
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/200StatusWithCallback'
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

        this.router.post("/", this.postMasterdata);

        /**
         * @swagger
         *
         *  '/masterdata/{masterdata_id}':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets an Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The Masterdata's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MasterdataMetadata'
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
         *        404:
         *          description: "Not Found"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/404Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/:masterdata_id", this.getMasterdata);

        /**
         * @swagger
         *
         *  '/masterdata':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets all Masterdata for organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/AllMasterdata'
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
         *        404:
         *          description: "Not Found"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/404Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/", this.getAllMasterData);

        /**
         * @swagger
         *
         *  '/masterdata/{masterdata_id}':
         *    delete:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Deletes a Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The Masterdata's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/200Response'
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
         *        404:
         *          description: "Not Found"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/404Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.delete("/:masterdata_id", this.deleteMasterdata);

        /**
         * @swagger
         *
         *  '/masterdata/{masterdata_id}/status':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets status of Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The Masterdata's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MasterdataStatus'
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
         *        404:
         *          description: "Not Found"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/404Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/:masterdata_id/status", this.getMasterdataStatus);
    }

    /**
     * Posts new masterdata by calling the masterdata service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    postMasterdata = async (req: express.Request, res: express.Response): Promise<boolean> => {

        var clientId: any;
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

            //call the masterdata service by name, passing the request body.
            //If configured correctly Istio will use service discovery to locate the
            //correct service to call.
            const serviceEndpoint = process.env.MASTERDATA_SERVICE + "/client/" + clientId + "/masterdata";

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
     * Gets masterdata details by calling the masterdata service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdata = async (req: express.Request, res: express.Response): Promise<boolean> => {

        let masterdataId = req.params.masterdata_id;
        var clientId: any;
        try {
            clientId = this.getClientId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 1000, e.stack, e.message );
            res.status(401).send({"success": false, "message": msg});
            return false;
        }

        try {
            const serviceEndpoint = process.env.MASTERDATA_SERVICE + "/client/" + clientId + "/masterdata/" + masterdataId;

            await axios.get(serviceEndpoint)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, clientId, 4003, error.stack, [masterdataId, JSON.stringify(error.response.data)] );
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, clientId, 4004, error.stack, [masterdataId, error.message] )
                            res.status(500).send({"success": false, "message": msg});
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 9001, e.stack, [masterdataId, e.message] )
            res.status(500).send({"success": false, "message": msg});
        }
        return true;
    }

    /**
     * Get all master data by calling the masterdata service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAllMasterData = async (req: express.Request, res: express.Response): Promise<boolean> => {

        var clientId: any;
        try {
            clientId = this.getClientId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 1000, e.stack, e.message );
            res.status(401).send({"success": false, "message": msg});
            return false;
        }

        try {
            const serviceEndpoint = process.env.MASTERDATA_SERVICE + "/client/" + clientId + "/masterdata/";

            await axios.get(serviceEndpoint)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, clientId, 4009, error.stack, [clientId, JSON.stringify(error.response.data)] );
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, clientId, 4010, error.stack, [clientId, error.message] )
                            res.status(500).send({"success": false, "message": msg});
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 9003, e.stack, [clientId, e.message] )
            res.status(500).send({"success": false, "message": msg});
        }
        return true;
    }

    /**
     * deletes a masterdata set by calling the masterdata service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteMasterdata = async (req: express.Request, res: express.Response): Promise<boolean> => {

        let masterdataId = req.params.masterdata_id;
        var clientId: any;
        try {
            clientId = this.getClientId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 1000, e.stack, e.message );
            res.status(401).send({"success": false, "message": msg});
            return false;
        }

        try {
            const serviceEndpoint = process.env.MASTERDATA_SERVICE + "/client/" + clientId + "/masterdata/" + req.params.masterdata_id;

            await axios.delete(serviceEndpoint)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, clientId, 4007, error.stack, [masterdataId, JSON.stringify(error.response.data)] );
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, clientId, 4008, error.stack, [masterdataId, error.message] )
                            res.status(500).send({"success": false, "message": msg});
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 9003, e.stack, [masterdataId, e.message] )
            res.status(500).send({"success": false, "message": msg});
        }
        return true;
    }

    /**
     * Gets master data status by calling the master data service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataStatus = async (req: express.Request, res: express.Response): Promise<boolean> => {

        let masterdataId = req.params.masterdata_id;
        var clientId: any;
        try {
            clientId = this.getClientId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 1000, e.stack, e.message );
            res.status(401).send({"success": false, "message": msg});
            return false;
        }

        try {
            const serviceEndpoint = process.env.MASTERDATA_SERVICE + "/client/" + clientId + "/masterdata/" + masterdataId + "/status";

            await axios.get(serviceEndpoint)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, clientId, 4005, error.stack, [masterdataId, JSON.stringify(error.response.data)] );
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, clientId, 4006, error.stack, [masterdataId, error.message] )
                            res.status(500).send({"success": false, "message": msg});
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, clientId, 9002, e.stack, [masterdataId, e.message] )
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