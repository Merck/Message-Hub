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
 * EPCIS MESSAGING HUB - EVENT SERVICE

 */

import express from "express";
import path from "path";
import axios from "axios";
import { CommonUtils } from "../utils/common-utils";
import { PostgresService } from "../services/postgres-service"
import { ErrorService } from "../services/error-service";
import { RabbitMQProcessor } from "../processor/rabbit-mq-processor"
import { DataPrivacyRulesProcessor } from "../rules/data-privacy-rules-processor";
import { ServiceError } from "../errors/service-error";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

let xmlParser = require("libxmljs");
let validator = require('xsd-schema-validator');
let parser = require("fast-xml-parser");
let jp = require('jsonpath');

/**
 * This is the main controller for the Event microservice.
 */
export class EventController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();
    private _rabbitMQProcessor: RabbitMQProcessor = new RabbitMQProcessor();
    private _dataPrivacyRulesProcessor: DataPrivacyRulesProcessor = new DataPrivacyRulesProcessor();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        this._rabbitMQProcessor.start();

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
         *  EventDestination:
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
         *  EventMetadata:
         *    type: object
         *    properties:
         *      id:
         *        type: string
         *        description: "The unique identifier for the event as assigned by the Messaging Hub"
         *        example: "123e4567-e89b-12d3-a456-426614174000"
         *      timestamp:
         *        type: string
         *        description: "The event timestamp obtained from the submitted XML payload (not the system time)"
         *        example: "2014-04-01 15:19:49.31146+05:30"
         *      client_id:
         *        type: string
         *        description: "The client_id from the client credentials that called the Events API and posted the XML"
         *        example: "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc"
         *      organization_id:
         *        type: number
         *        description: "The organization id that owns the client_id"
         *        example: 3
         *      type:
         *        type: string
         *        description: "The event type (object, aggregation, tranaction, transformation)"
         *        example: "object"
         *      action:
         *        type: string
         *        description: "The event action (add, delete, observe)"
         *        example: "add"
         *      source:
         *        type: string
         *        example: "ATTP"
         *      status:
         *        type: string
         *        example: "on_ledger"
         *      destinations:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventDestination'
         *  Event:
         *    allOf:
         *      - $ref: '#/definitions/EventMetadata'
         *      - type: object
         *        properties:
         *          originalMessage:
         *            type: string
         *            description: "The original EPCIS XML (redacted based on organization's Data Privacy Rules)"
         *            example: '<epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1"schemaVersion="1.2" creationDate="2012-03-29T17:10:16Z"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>'
         *  EventStatus:
         *    type: object
         *    properties:
         *      id:
         *        type: string
         *        description: "The unique identifier for the event as assigned by the Messaging Hub"
         *        example: "123e4567-e89b-12d3-a456-426614174000"
         *      status:
         *        type: string
         *        example: "on_ledger"
         *      destinations:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventDestination'
         *  EPCISDocument:
         *    type: object
         *    properties:
         *      EPCISBody:
         *        type: object
         *        properties:
         *          EventList:
         *            type: object
         *  EventQueueProcessing:
         *    type: object
         *    properties:
         *      queue:
         *        type: string
         *        example: "event-processor"
         *      messageCount:
         *        type: number
         *        example: 0
         *      consumerCount:
         *        type: number
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
         *  '/client/{clientId}/events':
         *    post:
         *      tags: ["Events API"]
         *      summary: "Adds a event to the processing queue"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/EventSearchMetadata'
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
        this.router.post("/client/:clientId/events", this.postEventForClient);

        /**
         * @swagger
         *  '/client/{clientId}/events/{eventId}':
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets a event and its current status from the database"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The unique id of the event that was assigned to by the hub"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Event'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        404:
         *          description: "Bad Request"
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
        this.router.get("/client/:clientId/events/:eventId", this.getEventForClient);
        
        /**
         * @swagger
         *  '/organization/{orgId}/events/{eventId}':
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets a event and its current status from the database for a given organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The unique id of the event that was assigned to by the hub"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Event'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        404:
         *          description: "Bad Request"
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
        this.router.get("/organization/:orgId/events/:eventId", this.getEventForOrganization);

        /**
         * @swagger
         *  '/client/{clientId}/events/{eventId}/status':
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the current status for an event from the database"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The unique id of the event that was assigned to by the hub"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/EventStatus'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        404:
         *          description: "Bad Request"
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
        this.router.get("/client/:clientId/events/:eventId/status", this.getEventStatusForClient);

        /**
         * @swagger
         *
         *  '/organization/{orgId}/event/{event_id}/blockchain/{bc_adapter_id}':
         *    get:
         *      tags:
         *        - "Events API"
         *      summary: "Gets Event from the specified blockchain for specified id"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: event_id
         *          in: path
         *          description: "The Event's unique id in the hub's database."
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
        this.router.get("/organization/:orgId/event/:eventId/blockchain/:adapterId", this.getEventFromBlockchain);

        /**
         * @swagger
         *  /organization/{orgId}/eventssources:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the Organization's unique event sources"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  type: array
         *                  items: string
         *                  example: ["ATTP (mock)"]
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/eventssources", this.getDistinctEventSourcesForOrganization);

        /**
         * @swagger
         *  /organization/{orgId}/eventsdestinations:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the Organization's unique event destinations"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  type: array
         *                  items: string
         *                  example: ["Mock Adapter", "Mock Adapter 2"]
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/eventsdestinations", this.getDistinctEventDestinationsForOrganization);


        /**
         * @swagger
         *  /organization/{orgId}/eventqueuecount:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the event messages processing in Rabbit MQ"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/EventQueueProcessing'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/eventqueuecount", this.getEventQueueMessagesCount);

        /**
         * @swagger
         *  /organization/{orgId}/eventretry:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Retry the failed event messages from deadletter queue to processing queue in Rabbit MQ"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
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
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */

        this.router.get("/organization/:orgId/eventretry", this.retryEventQueueMessagesDLX);

        /**
         * @swagger
         *  /organization/{orgId}/eventdlx/queuecount:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the failed event messages from deadletter queue in Rabbit MQ"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/EventQueueProcessing'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/eventdlx/queuecount", this.getEventDLXQueueMessagesCount);

        /**
         * @swagger
         *  /organization/{orgId}/events/queuestatus:
         *    post:
         *      tags: ["Events API"]
         *      summary: "Sets the event queuestatus to pause/resume the processing queue."
         *      description: "User must have hub_admin role to perform this function"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.post("/organization/:orgId/events/queuestatus", this.setEventQueueStatus);

        /**
         * @swagger
         *  /organization/{orgId}/queuestatus:
         *    post:
         *      tags: ["Events API"]
         *      summary: "Gets the queue status to pause/resume the processing queue."
         *      description: "User must have hub_admin role to perform this function"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Event BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/organization/:orgId/queuestatus", this.getQueueStatus);
    }

    /**
     * Accepts an event posted to the API
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    postEventForClient = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId;
        let source;
        let clientId = req.params.clientId;

        try {
            let response = await this.getOrganizationForClientId(req);
            orgId = response.data.organization_id;
            source = response.data.source_name;
        } catch (e) {
            let msg = ErrorService.reportError(orgId, clientId, 4002, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }

        await this.checkPayload(orgId, clientId, source, req, res);
    }

    /**
     * Attempts to parse the XML and hecks the incoming event against the schema
     *
     * @param orgId
     * @param clientId
     * @param source
     * @param req
     * @param res
     */
    private checkPayload = async (orgId: number, clientId: string, source: string, req: express.Request, res: express.Response): Promise<void> => {

        let buffer = req.body;
        let xmlPayload = buffer.toString('utf8');
        let xmlDoc: any;

        try {
            //parse the xml and ensure it is valid
            xmlDoc = await xmlParser.parseXmlString(xmlPayload);
        } catch (e) {
            let msg = ErrorService.reportError(orgId, clientId, 1000, e.stack, [e.message.split('\n').join('')]);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }


        //check the xml against the schema
        try {
            await this.validateXMLAgainstSchema(xmlPayload);
        } catch (e) {
            let msg = ErrorService.reportError(orgId, clientId, 1001, e.stack, [e.message.split('\n').join('').split('\r').join('').split('\t').join(' ')]);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }

        await this.processEvent(orgId, clientId, source, xmlDoc, res);
    }

    /**
     * Wraps the XSD Parser in a Promise
     *
     * @param xmlPayload
     */
    private validateXMLAgainstSchema = async (xmlPayload: any): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            await validator.validateXML(xmlPayload, './assets/EPCglobal-epcis-1_2.xsd', (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Processes an incoming event
     *
     * @param orgId
     * @param clientId
     * @param source
     * @param xmlDoc
     * @param res
     */
    private processEvent = async (orgId: number, clientId: string, source: string, xmlDoc: any, res: express.Response): Promise<void> => {
        try {
            //this is a much better parser. namespace is required to retain certain extension element attributes in the EventList.
            let json = parser.parse(xmlDoc.toString(), {
                arrayMode: false,
                ignoreNameSpace: false,
                ignoreAttributes: false,
                trimValues: true,
                attributeNamePrefix: '',
                attrNodeName: '',
                textNodeName: 'value',
                parseNodeValue: false
            })

            //let's use json paths to make this easier

            let aggrEvent = jp.nodes(json, '$..EventList.AggregationEvent');
            if (Array.isArray(aggrEvent) && aggrEvent.length > 0) {
                let msg = ErrorService.reportError(orgId, clientId, 1003, null, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }

            //first make sure we don't have more than one event type in the payload
            //use the unredacted json to perform this test
            let eventsInList = jp.nodes(json, '$..EventList.*');
            if (Array.isArray(eventsInList) && eventsInList.length !== 1) {
                let msg = ErrorService.reportError(orgId, clientId, 1002, null, eventsInList.length);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }
            //now make sure we don't have more than one of the same event type in the payload
            //use the unredacted json to perform this test
            let events = jp.value(json, '$..EventList.*');
            //console.log('event',events)
            if (Array.isArray(events) && events.length > 1) {
                let msg = ErrorService.reportError(orgId, clientId, 1002, null, events.length);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }

            //we need to redact the saved data based on the data privacy rules
            //got to clone this to retain the original
            let clonedJSON = JSON.parse(JSON.stringify(json));
            await this._dataPrivacyRulesProcessor.redact(clonedJSON, xmlDoc, orgId);
            let redactedJSON = clonedJSON;
            let redactedXML = xmlDoc.toString();
            if (redactedXML === '{"errors":[]}') {
                let msg = ErrorService.reportError(orgId, clientId, 4022, redactedXML, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }

            // now use the redacted JSON and get whatever info we can from it
            let eventType;
            let eventAction;
            let eventTime;
            let ids = [];

            let event = jp.value(redactedJSON, '$..EventList');
            if (event) {
                eventType = Object.keys(event)[0];
                if (eventType && eventType !== 'extension') {
                    eventType = eventType.toLowerCase().replace('event', '');
                } else if (eventType && eventType === 'extension') {    // support for other event objects
                    let otherEvent = jp.value(redactedJSON, '$..extension');
                    eventType = Object.keys(otherEvent)[0];
                    eventType = eventType.toLowerCase().replace('event', '');
                }
                eventTime = jp.value(event, '$..eventTime');
                eventAction = jp.value(event, '$..action');
                if (eventAction) {
                    eventAction = eventAction.toLowerCase();
                }

                // get the searchable EPC IDs (if they are not restricted in data privacy rules),
                // their paths vary by event type so use a generic path
                let epcIds = jp.query(event, '$..epc');
                if (epcIds) {
                    ids = epcIds;
                }
                //aggregation events also have a GTIN in the parentID
                let parentID = jp.value(event, '$..parentID');
                if (parentID) {
                    ids.push(parentID);
                }
            }

            //create the event id
            let eventId = commonUtils.generateID();

            let body = {
                organization: orgId,
                id: eventId,
                textids: ids,
                timestamp: eventTime,
                type: eventType,
                action: eventAction,
                source: source,
                status: "accepted"
            };

            const result = await this._postgresService.getEventQueueStatus();
            if (result.rowCount > 0) {
                const data = result.rows[0];
                if (data.events_paused) {
                    //save to database
                    await this._postgresService.insertEvent(eventId, eventTime, eventType, eventAction, "processing",
                        clientId, source, orgId, redactedXML, redactedJSON);
                    body.status = 'processing';
                    //save to elastic search
                    await this.saveToElasticSearch(orgId, body);
                    //put on the holding queue (use the non-redacted JSON since this full message needs to go to the blockchain)
                    await this._rabbitMQProcessor.publishEventHoldingQueue(JSON.stringify(json), eventId, clientId, orgId);
                    //return the response with the status callback url.
                    let callbackUrl = process.env.EVENT_BFF + '/events/' + eventId + '/status';
                    res.status(200).send({ "success": true, "message": "Processing", "callback": callbackUrl });
                    return;
                }
            }
            //save to database
            await this._postgresService.insertEvent(eventId, eventTime, eventType, eventAction, "accepted",
                clientId, source, orgId, redactedXML, redactedJSON);

            //save to elastic search
            await this.saveToElasticSearch(orgId, body);
            //put on the processing queue (use the non-redacted JSON since this full message needs to go to the blockchain)
            await this._rabbitMQProcessor.publishEvent(JSON.stringify(json), eventId, clientId, orgId);

            //return the response with the status callback url.
            let callbackUrl = process.env.EVENT_BFF + '/events/' + eventId + '/status';
            res.status(200).send({ "success": true, "message": "Accepted", "callback": callbackUrl });
        } catch (e) {
            if (e instanceof ServiceError) {
                let msg = ErrorService.reportError(orgId, clientId, e.errorCode, e.stack, null);
                res.status(400).send({ "success": false, "message": msg });
            } else {
                let msg = ErrorService.reportError(orgId, clientId, 9000, e.stack, null);
                res.status(400).send({ "success": false, "message": msg });
            }
        }
    }

    /**
     * Save the event details to Elastic search.
     *
     * @param orgId
     * @param body
     */
    private saveToElasticSearch = async (orgId: number, body: any): Promise<void> => {
        try {
            await axios.post(process.env.SEARCH_SERVICE + "/search/organizations/" + orgId + "/events", body);
        } catch (e) {
            throw new ServiceError(e, 4001);
        }
    }

    /**
     * Calls the Postgres service to get an event based on the supplied
     * event id and the caller's organization/client credentials
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventForClient = async (req: express.Request, res: express.Response): Promise<void> => {

        //get the organization id from the client id
        let orgId: any;
        try {
            let response = await this.getOrganizationForClientId(req);
            orgId = response.data.organization_id;
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 4002, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }

        //get the event if it belongs to the organization
        await this._postgresService.getEventForOrganization(orgId, req.params.eventId)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ "success": false, "message": "no event found" });
                } else {
                    let data = result.rows[0];
                    this._postgresService.getDestinationsForEvent(data.id).then(result => {
                        if (result.rowCount > 0) {
                            data.destinations = result.rows;
                        }
                        res.status(200).send(data);
                    });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            }
            );
    }

    /**
     * Calls the Postgres service to get an event based on the supplied
     * event id and the caller's organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getEventForOrganization(orgId, req.params.eventId)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ "success": false, "message": "no event found" });
                } else {
                    let data = result.rows[0];
                    this._postgresService.getDestinationsForEvent(data.id).then(result => {
                        if (result.rowCount > 0) {
                            data.destinations = result.rows;
                        }
                        res.status(200).send(data);
                    });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            }
            );
    }

    /**
     * Calls the Postgres service to get the status for an event based on the supplied
     * event id and the caller's organization/client credentials
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventStatusForClient = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId: any;
        try {
            let response = await this.getOrganizationForClientId(req);
            orgId = response.data.organization_id;
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 4002, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }

        await this._postgresService.getEventStatusForOrganization(orgId, req.params.eventId)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ "success": false, "message": "no event found" });
                } else {
                    let data = result.rows[0];
                    this._postgresService.getDestinationsForEvent(data.id).then(result => {
                        if (result.rowCount > 0) {
                            data.destinations = result.rows;
                        }
                        res.status(200).send(data);
                    });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4004, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            }
            );
    }

    /**
     * Gets the Event information from the blockchain by calling the adapter
     * @param req
     * @param res
     */
    getEventFromBlockchain = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        let adapterId = req.params.adapterId;
        let eventId = req.params.eventId;

        //first ensure the event id is valid and it belongs to the organization
        try{
            let status = await this._postgresService.getEventStatusForOrganization(orgId, req.params.eventId);
            if( status.rowCount == 0 ){
                res.status(404).send({ "success": false, "message": "no event found" });
                return;
            }
        } catch(error) {
            let msg = ErrorService.reportError(orgId, null, 4004, error.stack, null);
            res.status(500).send({ "success": false, "message": msg });
            return;
        }

        //call the adapter
        let serviceURI;

        //determine if running locally and env exists
        let envname = adapterId.toUpperCase().split('-').join('_') + "_SERVICE";
        if (process.env[envname]) {
            serviceURI = process.env[envname];
        } else {
            serviceURI = "http://" + adapterId + ":8080";
        }

        //call the adapter
        await axios.get(serviceURI + "/adapter/organization/" + orgId + "/event/" + eventId)
            .then(result => {
                res.status(result.status).send(result.data);
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(orgId, null, 4023, error.stack, [req.params.eventId, req.params.adapterId, orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4023, error.stack, [req.params.eventId, req.params.adapterId, orgId, error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            }
        );
    }

    /**
     * Calls the Postgres service to get the count of messages in Event queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventQueueMessagesCount = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        try {
            let result: any = await this._rabbitMQProcessor.getEventQueueMessagesCount();
            const holdingqueueResult: any = await this._rabbitMQProcessor.getEventHoldingQueueMessagesCount();
            result.messageCount = result.messageCount + holdingqueueResult.messageCount;
            result.consumerCount = result.consumerCount + holdingqueueResult.consumerCount;
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }

    /**
     * Calls the Postgres service to get distinct event sources for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDistinctEventSourcesForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getDistinctEventSourcesForOrganization(orgId)
            .then(result => {
                let values = [];
                for (let i = 0; i < result.rowCount; i++) {
                    values.push(result.rows[i].source);
                }
                res.status(200).send(values);
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4005, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            }
            );
    }

    /**
     * Calls the Postgres service to get distinct event destinations for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDistinctEventDestinationsForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getDistinctEventDestinationsForOrganization(orgId)
            .then(result => {
                let values = [];
                for (let i = 0; i < result.rowCount; i++) {
                    values.push(result.rows[i].destination);
                }
                res.status(200).send(values);
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4006, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            }
            );
    }

    /**
     * Calls the Rabbit mq to retry failed event messages from deadletter queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    retryEventQueueMessagesDLX = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        try {
            let events_paused: boolean = false;
            const result = await this._postgresService.getEventQueueStatus();
            if (result.rowCount > 0) {
                const data = result.rows[0];
                events_paused = data.events_paused;
            }
            const response = await this._rabbitMQProcessor.retryMessagesFromDLX(events_paused);
            res.status(200).send(response);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }

    /**
     * Calls the Rabbit mq to get the count of messages in Event Deadletter queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventDLXQueueMessagesCount = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._rabbitMQProcessor.getEventDLXQueueMessagesCount();
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }

    /**
     * Set the event queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    setEventQueueStatus = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = parseInt(req.params.orgId);
        const reqBody = req.body;
        // check if the events_paused is present or not since its a boolean variable
        if (!reqBody.hasOwnProperty('events_paused')) {
            res.status(400).send({ "success": false, "message": "Missing events_paused in request" });
            return;
        }
        let events_paused = reqBody.events_paused;

        // check if the masterdata_paused is present or not since its a boolean variable
        if (!reqBody.hasOwnProperty('masterdata_paused')) {
            res.status(400).send({ "success": false, "message": "Missing masterdata_paused in request" });
            return;
        }
        let masterdata_paused = reqBody.masterdata_paused;

        if (!reqBody.updated_by) {
            res.status(400).send({ "success": false, "message": "Missing updated_by in request" });
            return;
        }
        let updated_by = reqBody.updated_by;
        //save to database
        await this._postgresService.setEventQueueStatus(events_paused, masterdata_paused, updated_by)
            .then(result => {
                if (result.rowCount > 0) {
                    let data = result.rows[0];
                    if (!data.events_paused) {
                        this._rabbitMQProcessor.consumeEventHoldingQueue().catch((err) => {
                            ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
                        });
                    }
                }
                res.status(200).send(result.rows[0]);
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4017, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            });
    }

    /**
     * Gets the queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getQueueStatus = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getEventQueueStatus()
            .then(result => {
                if (result.rowCount > 0) {
                    res.status(200).send(result.rows[0]);
                } else {
                    res.status(200).send([]);
                }
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4019, e.stack, null);
                res.status(500).send({ "success": false, "message": msg });
            });
    }

    /**
     * Calls the organization service to find the organization associated with the client credentials
     *
     * @param req - the incoming request
     */
    private getOrganizationForClientId = async (req: express.Request) => {
        const options = {
            params: {
                clientid: req.params.clientId
            }
        };

        //get the organization for this subject
        return axios.get(process.env.ORGANIZATION_SERVICE + "/organizations/", options);
    }
}