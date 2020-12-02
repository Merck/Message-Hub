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
 * EPCIS MESSAGING HUB -METRICS SERVICE

 */

import express from "express";
import path from "path";
import { CommonUtils } from "../utils/common-utils";
import { PostgresService } from "../services/postgres-service"
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Metrics microservice.
 */
export class MetricsController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();

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
         *        example: "Not authorized to perform that action"
         *  404Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "Specified object not found"
         *  500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
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
         *        example: [{ "date": "8/25/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/26/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/27/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/28/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/29/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/30/2020", "object": 100, "transaction": 100, "transformation": 340 }, { "date": "8/31/2020", "object": 100, "transaction": 100, "transformation": 340 }]
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
         *        example: [{ "hours": 4, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 8, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 12, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 16, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 20, "object": 100, "transaction": 100, "transformation": 340 }, { "hours": 24, "object": 100, "transaction": 100, "transformation": 340 }]
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
         *        example: [{type: "object",count: 200}, {type: "transaction",count: 100}, {type: "transformation",count: 50}]
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
         *  '/organization/{orgId}/events/processed':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of messages processed from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MessagesProcessed'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/processed", this.getMessagesProcessed);


        /**
         * @swagger
         *  '/organization/{orgId}/events/period':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of event messages processed by period from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
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
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/period", this.getEventsByPeriod);

        /**
         * @swagger
         *  '/organization/{orgId}/events/type':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of event messages processed by type from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByType'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/type", this.getEventsByType);

        /**
         * @swagger
         *  '/organization/{orgId}/events/source':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of event messages processed by source from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesBySource'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/source", this.getEventsBySource);

        /**
         * @swagger
         *  '/organization/{orgId}/events/destination':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of event messages processed by destination from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByDestination'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/destination", this.getEventsByDestination);

        /**
         * @swagger
         *  '/organization/{orgId}/events/status':
         *    get:
         *      tags: ["Metrics API"]
         *      summary: "Gets the count of event messages processed by status from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayEventMessagesByStatus'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/events/status", this.getEventsByStatus);
    }

    /**
     * Gets total event and master data messages processed.
     *
     * @param req
     * @param res
     */
    getMessagesProcessed = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            let response: any = {};
            const eventResult = await this._postgresService.getCountOfEvents(orgId);
            response.eventMessages = parseInt(eventResult.rows[0].count);
            const masterdataResult = await this._postgresService.getCountOfMasterdata(orgId);
            response.masterdataMessages = parseInt(masterdataResult.rows[0].count);
            res.status(200).send(response);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }

    /**
     * Gets events messages processed by period.
     *
     * @param req
     * @param res
     */
    getEventsByPeriod = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        if (req.query.duration === undefined) {
            res.status(400).send({ "success": false, "message": "Missing duration in query of request" });
            return false;
        }
        let result;
        const queryDuration = req.query.duration;
        try {
            if (queryDuration === 'past week') {
                result = await this._postgresService.getCountOfEventsPastWeek(orgId);
            } else if (queryDuration === 'past day') {
                result = await this._postgresService.getCountOfEventsPastDay(orgId);
            } else if (queryDuration === 'past hour') {
                result = await this._postgresService.getCountOfEventsPastHour(orgId);
            } else {
                let msg = ErrorService.reportError(orgId, null, 1001, null, null);
                res.status(400).send({ "success": false, "message": "Provide duration as either past week or past day or past hour in query of request" });
                return false;
            }
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }

    /**
     * Gets events messages processed by type.
     *
     * @param req
     * @param res
     */
    getEventsByType = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            const response = await this._postgresService.getCountOfEventsType(orgId);
            res.status(200).send(response);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }

    /**
     * Gets events messages processed by source.
     *
     * @param req
     * @param res
     */
    getEventsBySource = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._postgresService.getCountOfEventsSource(orgId);
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }

    /**
     * Gets events messages processed by destination.
     *
     * @param req
     * @param res
     */
    getEventsByDestination = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._postgresService.getCountOfEventsDestination(orgId);
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }

    /**
     * Gets events messages processed by status.
     *
     * @param req
     * @param res
     */
    getEventsByStatus = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._postgresService.getCountOfEventsStatus(orgId);
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
        return true;
    }
}