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
import { AdministrationOrganizationController } from "./administration-organization-controller";
import { AdministrationController } from "./administration-controller";
import { AdministrationMasterdataController } from "./administration-masterdata-controller";
import { ErrorService } from "../services/error-service";

let querystring = require('querystring');
let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationEventsController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         *
         * definitions:
         *  QueueCount:
         *    type: object
         *    properties:
         *      eventQueue:
         *        type: object
         *        properties:
         *          queue: 
         *            description: "The queue name"
         *            type: string
         *            example: "event-processor"
         *          messageCount:
         *            type: number
         *            description: "The number of messages in the queue"
         *            example: 0
         *          consumerCount:
         *            type: number
         *            description: "consumer count of messages in the queue"
         *            example: 0
         *      masterQueue:
         *        type: object
         *        properties:
         *          queue: 
         *            description: "The queue name"
         *            type: string
         *            example: "masterdata-processor"
         *          messageCount:
         *            type: number
         *            description: "The number of messages in the queue"
         *            example: 0
         *          consumerCount:
         *            type: number
         *            description: "consumer count of messages in the queue"
         *            example: 0
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
         *  Sort:
         *    type: object
         *    properties:
         *      columnname:
         *        type: object
         *        properties:
         *          order:
         *            type: string
         *            example: "asc"
         *  EventSearchMetadata:
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
         *      organization_id:
         *        type: number
         *        description: "The organization id that owns the client_id"
         *        example: 3
         *      textids:
         *        type: array
         *        items: string
         *        example: ["urn:epc:id:sgtin:8888555.600301.100000043583","urn:epc:id:sgtin:8888555.600301.100000043771"]
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
         *        items: string
         *        example: ["Mock Adapter"]
         *  SearchResultList:
         *    type: object
         *    properties:
         *      totalResults:
         *        type: number
         *        example: 153
         *      currentPage:
         *        type: number
         *        example: 1
         *      totalPages:
         *        type: number
         *        example: 7
         *      resultsPerPage:
         *        type: number
         *        example: 25
         *      sorted:
         *        type: array
         *        items:
         *          $ref: '#/definitions/Sort'
         *      results:
         *        type: array
         *        items:
         *          $ref: '#/definitions/EventSearchMetadata'
         *  FailedQueueCount:
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

        //DEPRECATED-----
        this.router.get("/events/processing", this.getProcessingQueueCount);
        this.router.get("/events/failed", this.getDeadLetterQueueCount);
        this.router.get("/eventsources", this.getEventSourcesConfig);
        this.router.get("/eventdestinations", this.getEventDestinationsConfig);
        //----------

        /**
         * @swagger
         *
         * /admin/events/status/processing:
         *   get:
         *      tags: ["Events API"]
         *      summary: "Gets the number of messages in the event and masterdata processing queue"
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
        this.router.get("/events/status/processing", this.getProcessingQueueCount);

        /**
         * @swagger
         *
         *  /admin/events/status/failed:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the number of messages in the organization's dead letter queue"
         *      description: "User must have hub_admin role to perform this function"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/FailedQueueCount'
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
        this.router.get("/events/status/failed", this.getDeadLetterQueueCount);

        /**
         * @swagger
         *  /admin/events/config/sources:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the Organization's unique event sources"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  type: array
         *                  items: string
         *                  example: ["ATTP (mock)"]
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
        this.router.get("/events/config/sources", this.getEventSourcesConfig);

        /**
         * @swagger
         *  /admin/events/config/destinations:
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets the Organization's unique event destinations"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  type: array
         *                  items: string
         *                  example: ["Mock Adapter", "Mock Adapter 2"]
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
        this.router.get("/events/config/destinations", this.getEventDestinationsConfig);

        /**
         * @swagger
         *  /admin/events/search:
         *    post:
         *      tags: ["Events API"]
         *      summary: "Searches for an organization's processed events"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                text:
         *                  type: string
         *                  description: "Any of the fields within the event e.g. GTIN, Serial Number, Lot Number, etc that would indexed as fuzzy searchable fields"
         *                  example: "100000000022"
         *                startdate:
         *                  type: string
         *                  description: "The starting date for a date range search"
         *                  example: "2020-07-06T05:00:00.000Z"
         *                enddate:
         *                  type: string
         *                  description: "The ending date for a date range search"
         *                  example: "2020-07-10T05:00:00.000Z"
         *                type:
         *                  type: string
         *                  description: "The event type e.g. Object"
         *                  example: "object"
         *                action:
         *                  type: string
         *                  description: "The event action e.g. Add"
         *                  example: "add"
         *                source:
         *                  type: string
         *                  description: "The event's originating source"
         *                  example: "ATTP (mock)"
         *                destination:
         *                  type: string
         *                  description: "The event's ledger destination"
         *                  example: "Mock Adapter"
         *                status:
         *                  type: string
         *                  description: "The event's status"
         *                  example: "accepted"
         *                pagenumber:
         *                  type: number
         *                  description: "The page number of results to fetch"
         *                  example: 1
         *                resultsperpage:
         *                  type: number
         *                  description: "The number of results per page"
         *                  example: 25
         *                sort:
         *                  type: array
         *                  items:
         *                    $ref: '#/definitions/Sort'
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/SearchResultList'
         *        400:
         *          description: "Bad Request"
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
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.post("/events/search", this.search);

        /**
         * @swagger
         *
         *  '/admin/events/{eventId}':
         *    get:
         *      tags: ["Events API"]
         *      summary: "Gets an event based on the event_id"
         *      description: ""
         *      parameters:
         *        - name: eventId
         *          in: path
         *          description: "The event's unique id in the hub's database."
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
        this.router.get("/events/:eventId", this.getEvent);
        
        /**
         * @swagger
         *
         *  '/admin/events/{event_id}/blockchain/{bc_adapter_id}':
         *    get:
         *      tags:
         *        - "Events API"
         *      summary: "Gets Event from the specified blockchain for specified id"
         *      parameters:
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
        this.router.get("/events/:eventId/blockchain/:adapterId", this.getEventFromBlockchain);
        
        /**
         * @swagger
         *
         *  '/admin/events_retry':
         *    get:
         *      tags: ["Events API"]
         *      summary: "Retries the failed event messages from deadletter queue by calling event service"
         *      description: ""
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
        this.router.get("/events_retry", this.retryEventsQueueMessagesDLX);

        /**
         * @swagger
         *
         *  /admin/events/queuestatus:
         *    post:
         *      tags: ["Event API"]
         *      summary: "Sets the event queuestatus to pause/resume the processing queue."
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
        this.router.post("/events/queuestatus", this.setEventQueueStatus);
        
        /**
         * @swagger
         *
         *  /admin/queuestatus:
         *    get:
         *      tags: ["Event API"]
         *      summary: "Gets the queue status to pause/resume the processing queue."
         *      description: "User must have hub_admin role to perform this function"
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
        this.router.get("/queuestatus", this.getQueueStatus);
    }

    /**
     * Searches for events using the search-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    search = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            const options = {
                params: req.body
            };

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the search service
            await axios.get(process.env.SEARCH_SERVICE + '/search/organizations/' + orgId + '/events', options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4011, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4012, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9005, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets an event using the event-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEvent = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            //call the event service
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/events/' + req.params.eventId)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4013, error.stack, [req.params.eventId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4014, error.stack, [req.params.eventId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9006, e.stack, [req.params.eventId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the event from the blockchain if it is available
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventFromBlockchain = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return;
            }

            //call the event service
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/event/' + req.params.eventId + "/blockchain/" + req.params.adapterId)
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4110, error.stack, [req.params.eventId, req.params.adapterId, orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4110, error.stack, [req.params.eventId, req.params.adapterId, orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9048, e.stack, [req.params.eventId, req.params.adapterId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Gets the distinct Event sources for the user's organization using the event-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventSourcesConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/eventssources')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4015, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4016, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9007, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets the distinct Event destinations for the user's organization using the event-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventDestinationsConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/eventsdestinations')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4017, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4018, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9008, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the number of messages currently in the event and masterdata processing queue using event-service and masterdata service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getProcessingQueueCount = async (req: express.Request, res: express.Response): Promise<boolean> => {
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

            let queueMessagesCount: any = {};
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/eventqueuecount')
                .then((response) => {
                    queueMessagesCount.eventQueue = response.data;
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4019, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4020, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
            await AdministrationMasterdataController.getProcessingQueueCount(orgId)
                .then((response) => {
                    queueMessagesCount.masterdataQueue = response.data;
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4019, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4020, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
            res.status(200).send(queueMessagesCount);
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9009, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the number of messages currently in the event deadletter queue using event-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDeadLetterQueueCount = async (req: express.Request, res: express.Response): Promise<any> => {
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
            //call the event service
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/eventdlx/queuecount')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4021, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4022, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9010, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * retry failed event messages Deadletter queue from Rabbit MQ.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    retryEventsQueueMessagesDLX = async (req: express.Request, res: express.Response): Promise<any> => {
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
            //call the event service
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/eventretry')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4023, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4024, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                })
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9011, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Set the event queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    setEventQueueStatus = async (req: express.Request, res: express.Response): Promise<any> => {
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
            //call the event service
            await axios.post(process.env.EVENT_SERVICE + '/organization/' + orgId + '/events/queuestatus', req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4025, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4026, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                })
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9012, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }

    /**
     * Gets the queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getQueueStatus = async (req: express.Request, res: express.Response): Promise<any> => {
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
            //call the event service
            await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/queuestatus')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4027, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4028, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                })
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9013, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
    }
}