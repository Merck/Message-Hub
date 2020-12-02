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
import axios from "axios";
import { CommonUtils } from "../utils/common-utils";

import { AdministrationController } from "./administration-controller";
import { AdministrationOrganizationController } from "./administration-organization-controller";
import { ErrorService } from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationMasterdataController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         *
         * definitions:
         *  Masterdata:
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
         *        description: "The client_id from the client credentials that called the Masterdata's API and posted the XML"
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
         *        example: '<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1"schemaVersion="1.2" creationDate="2012-03-29T17:10:16Z"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>'
         *      json_data:
         *        type: string
         *        example: "master data as json value"
         *  ArrayMasterdata:
         *        type: array
         *        items:
         *          $ref: '#/definitions/Masterdata'
         *        description: "The original EPCIS XML (redacted based on organization's Data Privacy Rules)"
         *        example: '<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1"schemaVersion="1.2" creationDate="2012-03-29T17:10:16Z"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>'
         *  QueueCount:
         *    type: object
         *    properties:
         *      queue: 
         *        description: "The queue name"
         *        type: string
         *        example: "masterdata-processor"
         *      messageCount:
         *        type: number
         *        description: "The number of messages in the queue"
         *        example: 0
         *      consumerCount:
         *        type: number
         *        description: "consumer count of messages in the queue"
         *        example: 0
         *  QueueStatus:
         *    type: object
         *    properties:
         *      id:
         *        type: number
         *        example: 5
         *      events_paused:
         *        type: boolean
         *        example: true
         *      masterdata_paused:
         *        type: boolean
         *        example: false
         *      updated_by:
         *        type: string
         *        example: "Hub admin"
         *      timestamp:
         *        type: string
         *        example: "2020-09-16T15:29:26.474Z"
         */


        /**
         * @swagger
         *
         *  '/admin/masterdata':
         *    get:
         *      tags: ["Master data API"]
         *      summary: "Gets all master data for organization"
         *      description: ""
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayMasterdata'
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
        this.router.get("/masterdata", this.getMasterData);

        /**
         * @swagger
         *
         *  '/admin/masterdata/{masterdataId}':
         *    get:
         *      tags: ["Master data API"]
         *      summary: "Gets a master data based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The masterdata's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Masterdata'
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
        this.router.get("/masterdata/:masterdata_id", this.getMasterDataById);

        /**
         * @swagger
         *
         *  '/admin/masterdata/{masterdataId}':
         *    delete:
         *      tags: ["Master data API"]
         *      summary: "Deletes a master data based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The masterdata's unique id in the hub's database."
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
        this.router.delete("/masterdata/:masterdata_id", this.deleteMasterDataById);

        /**
         * @swagger
         *
         *  '/admin/masterdata/{masterdata_id}/blockchain/{bc_adapter_id}':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets Masterdata from the specified blockchain for specified id"
         *      parameters:
         *        - name: masterdata_id
         *          in: path
         *          description: "The Masterdata's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *        - name: bc_adapter_id
         *          in: path
         *          description: "The Blockchain adapter ID."
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
        this.router.get("/masterdata/:masterdataId/blockchain/:adapterId", this.getMasterdataFromBlockchain);

        /**
         * @swagger
         *
         *  '/admin/masterdata_retry':
         *    get:
         *      tags: ["Master data API"]
         *      summary: "Retries the failed masterdata messages from deadletter queue by calling masterdata service"
         *      description: "User must have hub_admin role to perform this function"
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
        this.router.get("/masterdata_retry", this.retryMasterdataQueueMessagesDLX);

        /**
         * @swagger
         *
         *  /admin/masterdata/status/failed:
         *    get:
         *      tags: ["Master data API"]
         *      summary: "Gets the number of masterdata messages in the Rabbit mq dead letter queue"
         *      description: "User must have hub_admin role to perform this function"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/QueueCount'
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
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/masterdata/status/failed", this.getMasterdataDLXQueueMessagesCount);

        /**
         * @swagger
         *
         *  /admin/masterdata/queuestatus:
         *    post:
         *      tags: ["Master data API"]
         *      summary: "Sets the masterdata queuestatus to pause/resume the processing queue."
         *      description: "User must have hub_admin role to perform this function"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                events_paused:
         *                  type: boolean
         *                  description: "whether to pause/resume the event processing queue"
         *                  example: true
         *                masterdata_paused:
         *                  type: boolean
         *                  description: "whether to pause/resume the masterdata processing queue"
         *                  example: true
         *                updated_by:
         *                  type: string
         *                  description: "user who is performing this action"
         *                  example: "Hub admin"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/QueueStatus'
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
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.post("/masterdata/queuestatus", this.setMasterdataQueueStatus);
    }

    /**
     * Get all the Master Data for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterData = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the masterdata service
            await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4046, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4047, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9018, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Get Master Data for an organization id and master data id
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterDataById = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the masterdata service
            await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata/' + req.params.masterdata_id)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4048, error.stack, [req.params.masterdata_id, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4049, error.stack, [req.params.masterdata_id, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9019, e.stack, [req.params.masterdata_id, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the masterdata from the blockchain if it is available
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataFromBlockchain = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return;
            }

            console.log("URL = " + process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata/' + req.params.masterdataId + "/blockchain/" + req.params.adapterId);
            //call the masterdata service
            await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata/' + req.params.masterdataId + "/blockchain/" + req.params.adapterId)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4111, error.stack, [req.params.masterdataId, req.params.adapterId, orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4111, error.stack, [req.params.masterdataId, req.params.adapterId, orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9049, e.stack, [req.params.masterdataId, req.params.adapterId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Get processing queue count of masterdata from Rabbit MQ.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    public static getProcessingQueueCount = async (orgId: any): Promise<any> => {
        try {
            //call the masterdata service
            return await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdataqueuecount');
        } catch (e) {
            throw e;
        }
    }

    /**
     * retry failed masterdata messages Deadletter queue from Rabbit MQ.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    retryMasterdataQueueMessagesDLX = async (req: express.Request, res: express.Response): Promise<any> => {
        let orgId = '';
        try {
            //user must have the hub_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "hub_admin");
            if (!hasPermission) {
                res.status(401).send({ "success": false, "message": "user doesn't have the required role" });
                return true;
            }

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }
            //call the masterdata service
            await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdataretry')
            .then((response) => {
                res.status(response.status).send(response.data);
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(orgId, null, 4050, error.stack, [orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4051, error.stack, [orgId, error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9020, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Get the count of masterdata messages in Deadletter queue on Rabbitmq .
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataDLXQueueMessagesCount = async (req: express.Request, res: express.Response): Promise<any> => {
        let orgId = '';
        try {
            //user must have the hub_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "hub_admin");
            if (!hasPermission) {
                res.status(401).send({ "success": false, "message": "user doesn't have the required role" });
                return true;
            }

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }
            //call the masterdata service
            await axios.get(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdatadlx/queuecount')
            .then((response) => {
                res.status(response.status).send(response.data);
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(orgId, null, 4052, error.stack, [orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4053, error.stack, [orgId, error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9021, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Delete Master Data for an organization id and master data id
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteMasterDataById = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the masterdata service
            await axios.delete(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata/' + req.params.masterdata_id)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4054, error.stack, [req.params.masterdata_id, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4055, error.stack, [req.params.masterdata_id, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9022, e.stack, [req.params.masterdata_id, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Set the masterdata queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    setMasterdataQueueStatus = async (req: express.Request, res: express.Response): Promise<any> => {
        let orgId = '';
        try {
            //user must have the hub_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "hub_admin");
            if (!hasPermission) {
                res.status(401).send({ "success": false, "message": "user doesn't have the required role" });
                return true;
            }

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }
            //call the masterdata service
            await axios.post(process.env.MASTERDATA_SERVICE + '/organization/' + orgId + '/masterdata/queuestatus', req.body)
            .then((response) => {
                res.status(response.status).send(response.data);
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(orgId, null, 4056, error.stack, [orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4057, error.stack, [orgId, error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9023, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }
}