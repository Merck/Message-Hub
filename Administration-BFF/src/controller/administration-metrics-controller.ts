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

import {CommonUtils} from "../utils/common-utils";
import {AdministrationOrganizationController} from "./administration-organization-controller";
import { ErrorService } from "../services/error-service";

let querystring = require('querystring');
let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationMetricsController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {

        /**
         * @swagger
         *
         * definitions:
         *  MessagesProcessed:
         *    type: object
         *    properties:
         *      eventMessages:
         *        type: number
         *        description: "The count of Event messages processed."
         *        example: 38
         *      masterdataMessages:
         *        type: number
         *        description: "The count of Masterdata messages processed"
         *        example: 89
         *  EventsByPastWeek:
         *    type: object
         *    properties:
         *      date:
         *        type: string
         *        description: "The date of the past week."
         *        example: "8/25/2020"
         *      object:
         *        type: number
         *        description: "The count of Event object processed on the date"
         *        example: 10
         *      aggregation:
         *        type: number
         *        description: "The count of Event aggregation processed on the date"
         *        example: 10
         *      transaction:
         *        type: number
         *        description: "The count of Event transaction processed on the date"
         *        example: 10
         *      transformation:
         *        type: number
         *        description: "The count of Event transformation processed on the date"
         *        example: 10
         *  ArrayEventsByPastWeek:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventsByPastWeek'
         *        description: "array of past week days for which the count of event is returned."
         *        example: [{ "date": "8/25/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/26/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/27/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/28/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/29/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/30/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "date": "8/31/2020", "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }]
         *  EventsByPastDay:
         *    type: object
         *    properties:
         *      hours:
         *        type: number
         *        description: "The hours of the past day."
         *        example: 8
         *      object:
         *        type: number
         *        description: "The count of Event object processed on the hours"
         *        example: 10
         *      aggregation:
         *        type: number
         *        description: "The count of Event aggregation processed on the hours"
         *        example: 10
         *      transaction:
         *        type: number
         *        description: "The count of Event transaction processed on the hours"
         *        example: 10
         *      transformation:
         *        type: number
         *        description: "The count of Event transformation processed on the hours"
         *        example: 10
         *  ArrayEventsByPastDay:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventsByPastDay'
         *        description: "array of past day for which the count of event is returned."
         *        example: [{ "hours": 4, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "hours": 8, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "hours": 12, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "hours": 16, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "hours": 20, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }, { "hours": 24, "object": 100, "aggregation": 180, "transaction": 100, "transformation": 340 }]
         *  EventMessagesByType:
         *    type: object
         *    properties:
         *      type:
         *        type: string
         *        description: "The type of Event processed."
         *        example: "object"
         *      count:
         *        type: number
         *        description: "The count of Event messages processed by type"
         *        example: 89
         *  ArrayEventMessagesByType:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventMessagesByType'
         *        description: "array of event messages count by type."
         *        example: [{type: "object",count: 200}, {type: "aggregation",count: 300}, {type: "transaction",count: 100}, {type: "transformation",count: 50}]
         *  EventMessagesBySource:
         *    type: object
         *    properties:
         *      source:
         *        type: string
         *        description: "The Source of Event processed."
         *        example: "Source 1"
         *      count:
         *        type: number
         *        description: "The count of Event messages processed by Source"
         *        example: 89
         *  ArrayEventMessagesBySource:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventMessagesBySource'
         *        description: "array of event messages count by Source."
         *        example: [{source: "source 1",count: 200}, {source: "source 2",count: 300}, {source: "source 3",count: 100}, {source: "source 4",count: 50}]
         *  EventMessagesByDestination:
         *    type: object
         *    properties:
         *      destination_name:
         *        type: string
         *        description: "The Destination of Event processed."
         *        example: "Destination 1"
         *      count:
         *        type: number
         *        description: "The count of Event messages processed by Destination"
         *        example: 89
         *  ArrayEventMessagesByDestination:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventMessagesByDestination'
         *        description: "array of event messages count by Destination."
         *        example: [{destination_name: "destination 1",count: 200}, {destination_name: "destination 2",count: 300}, {destination_name: "destination 3",count: 100}, {destination_name: "destination 4",count: 50}]
         *  EventMessagesByStatus:
         *    type: object
         *    properties:
         *      status:
         *        type: string
         *        description: "The Status of Event processed."
         *        example: "Status 1"
         *      count:
         *        type: number
         *        description: "The count of Event messages processed by Status"
         *        example: 89
         *  ArrayEventMessagesByStatus:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventMessagesByStatus'
         *        description: "array of event messages count by Status."
         *        example: [{status: "status 1",count: 200}, {status: "status 2",count: 300}, {status: "status 3",count: 100}, {status: "status 4",count: 50}]
         */

        /**
         * @swagger
         *
         *  /admin/metrics/events/processed:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the number of events processed for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MessagesProcessed'
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
        this.router.get("/metrics/events/processed", this.getMessagesProcessed);

        /**
         * @swagger
         *
         *  /admin/metrics/events/period:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the number and types of events processed for a given period for the user's organization"
         *      parameters:
         *        - name: duration
         *          in: query
         *          description: "The duration of the events count to be returned."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventsByPastWeek'
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
        this.router.get("/metrics/events/period", this.getMessagesByPeriod);

        /**
         * @swagger
         *
         *  /admin/metrics/events/type:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the metrics on the number of events by type processed for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByType'
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
        this.router.get("/metrics/events/type", this.getMessagesByType);

        /**
         * @swagger
         *
         *  /admin/metrics/events/source:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the metrics on the number of events by source processed for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesBySource'
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
        this.router.get("/metrics/events/source", this.getMessagesBySource);

        /**
         * @swagger
         *
         *  /admin/metrics/events/destination:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the metrics on the number of events by destination processed for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByDestination'
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
        this.router.get("/metrics/events/destination", this.getMessagesByDestination);

        /**
         * @swagger
         *
         *  /admin/metrics/events/status:
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the metrics on the number of events by status processed for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByStatus'
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
        this.router.get("/metrics/events/status", this.getMessagesByStatus);
    }

    /**
     * Gets a count of all the messages processed for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesProcessed = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/processed')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4058, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4059, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9024, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets metrics on all messages processed for a given period
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesByPeriod = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }
            let duration;
            if (req.query.duration)
                duration = req.query.duration;

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/period?duration=' + duration)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4060, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4061, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9025, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets metrics on all messages processed by event type
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesByType = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/type')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4062, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4063, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9026, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets metrics on all messages processed by event source
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesBySource = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/source')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4064, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4065, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9027, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets metrics on all messages processed by blockchain adapter destination
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesByDestination = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/destination')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4066, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4067, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9028, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets metrics on all messages processed by status
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMessagesByStatus = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the metrics service
            await axios.get(process.env.METRICS_SERVICE + '/organization/' + orgId + '/events/status')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4068, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4069, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9029, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }
}