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
 * EPCIS MESSAGING HUB - SEARCH SERVICE

 */

import express from "express";
import { ElasticSearchService } from "../services/elasticsearch-service";
import * as config from '../config/_es.search.settings.json';
import { ErrorService } from "../services/error-service";


export class SearchController {

    public router = express.Router();
    private _elasticSearchService: ElasticSearchService = new ElasticSearchService();

    constructor() {
        this.initIndexMapping();

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
         *        example: success
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
         */

        /**
         * @swagger
         *
         *  '/search/organizations/{orgId}/events':
         *    get:
         *      tags: ["Search API"]
         *      summary: "Performs a search for events in Elasticsearch"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: text
         *          in: query
         *          description: "Any IDs or other text-based elements to search upon"
         *          required: false
         *          schema:
         *            type: string
         *        - name: startdate
         *          in: query
         *          description: "Any start date for the date range query"
         *          required: false
         *          schema:
         *            type: string
         *        - name: enddate
         *          in: query
         *          description: "Any end date for the date range query"
         *          required: false
         *          schema:
         *            type: string
         *        - name: type
         *          in: query
         *          description: "Any event type (object, aggregration, transaction, transformation) upon which to search"
         *          required: false
         *          schema:
         *            type: string
         *        - name: action
         *          in: query
         *          description: "Any event action (add, delete, observe) upon which to search"
         *          required: false
         *          schema:
         *            type: string
         *        - name: source
         *          in: query
         *          description: "Any event source upon which to search"
         *          required: false
         *          schema:
         *            type: string
         *        - name: destination
         *          in: query
         *          description: "Any event destination upon which to search"
         *          required: false
         *          schema:
         *            type: string
         *        - name: status
         *          in: query
         *          description: "Any event status (accepted, failed, on_ledger) upon which to search"
         *          required: false
         *          schema:
         *            type: string
         *        - name: pagenumber
         *          in: query
         *          description: "The page number of results to fetch"
         *          required: false
         *          schema:
         *            type: number
         *            example: 1
         *        - name: resultsperpage
         *          in: query
         *          description: "The number of results per page to fetch"
         *          required: false
         *          schema:
         *            type: number
         *            example: 25
         *        - name: sort
         *          in: query
         *          description: "The columns and directions (asc, desc) on which to sort the results"
         *          required: false
         *          schema:
         *              type: array
         *              items:
         *                $ref: "#/definitions/Sort"
         *              example: "[]"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/SearchResultList'
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
        this.router.get("/search/organizations/:orgId/events", this.executeSearch);

        /**
         * @swagger
         *
         *  '/search/organizations/{orgId}/events':
         *    post:
         *      tags: ["Search API"]
         *      summary: "Adds an individual event to Elasticsearch"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              $ref: '#/definitions/EventSearchMetadata'
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
        this.router.post("/search/organizations/:orgId/events", this.addEventToSearchIndex);

        /**
         * @swagger
         *
         *  '/search/organizations/{orgId}/events/{eventId}':
         *    get:
         *      tags: ["Search API"]
         *      summary: "Gets an individual event in Elasticsearch"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The event's unique id assigned to it by the hub"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/EventSearchMetadata'
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
        this.router.get("/search/organizations/:orgId/events/:eventId", this.getEventBasedOnID);

        /**
         * @swagger
         *
         *  '/search/organizations/{orgId}/events/{eventId}':
         *    patch:
         *      tags: ["Search API"]
         *      summary: "Updates an individual event in Elasticsearch"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The event's unique id assigned to it by the hub"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              $ref: '#/definitions/EventSearchMetadata'
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
        this.router.patch("/search/organizations/:orgId/events/:eventId", this.updateEventBasedOnID);

        /**
         * @swagger
         *
         *  '/search/organizations/{orgId}/events/{eventId}':
         *    delete:
         *      tags: ["Search API"]
         *      summary: "Deletes an individual event in Elasticsearch"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: eventId
         *          in: path
         *          description: "The event's unique id assigned to it by the hub"
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
        this.router.delete("/search/organizations/:orgId/events/:eventId", this.deleteEventBasedOnID);

        /**
         * Do not expose in Swagger docs
         */
        this.router.delete("/search/indices", this.deleteIndexFromElasticSearchDB);
    }

    /**
     * Initializes the Elasticsearch Index (if not present) and Mapping when the service starts
     */
    private initIndexMapping = async (): Promise<void> => {
        await this._elasticSearchService.createIndexMapping();
    };


    /**
     * Executes a search using Elasticsearch
     *
     * @param req - the incoming request containing the search parameters
     * @param res - the outgoing response
     */
    executeSearch = async (req: express.Request, res: express.Response): Promise<void> => {
        let organization_id = req.params.orgId;
        if (!organization_id) {
            res.status(400).send({ success: false, message: "orgId path parameter is required" });
            return;
        }

        let queryParams = req.query;

        let queryMust = [];
        let queryFilter = [];
        let sortVal = [];
        let deriveSort = [];

        let orgQuery: { [index: string]: any } = {};
        orgQuery['match'] = { 'organization': organization_id };
        queryMust.push(orgQuery);

        // Below fields in queryMust correspond to "eventModel in config file", any change in the below field name should be updated here.

        if (queryParams.text) {
            if (Array.isArray(queryParams.text) && queryParams.text.length > 0) {
                let textArray = [];
                let query: { [index: string]: any } = {};
                for (let i = 0; i < queryParams.text.length; i++) {
                    //let query: { [index: string]: any } = {};
                    let text: string = queryParams.text[i] as string;
                    text = await this.sanitizeQuery(text);
                    textArray.push(text);
                    //query['query_string'] = { "default_field": 'textids', "query": '*' + text + '*' };
                    //queryMust.push(query);
                }
                query['query_string'] = { "default_field": 'textids', "query": '*' + textArray + '*' };
                queryMust.push(query);
            } else {
                let query: { [index: string]: any } = {};
                let text: string = queryParams.text as string;
                text = await this.sanitizeQuery(text);
                query['query_string'] = { "default_field": 'textids', "query": '*' + text + '*' };
                queryMust.push(query);
            }
        }

        if (queryParams.startdate) {
            let query: { [index: string]: any } = {};
            query['range'] = { 'timestamp': { 'gte': queryParams.startdate } };
            queryFilter.push(query);
        }

        if (queryParams.enddate) {
            let query: { [index: string]: any } = {};
            query['range'] = { 'timestamp': { 'lte': queryParams.enddate } };
            queryFilter.push(query);
        }

        if (queryParams.type) {
            let query: { [index: string]: any } = {};
            query['match'] = { 'type': queryParams.type };
            queryMust.push(query);
        }

        if (queryParams.action) {
            let query: { [index: string]: any } = {};
            query['match'] = { 'action': queryParams.action };
            queryMust.push(query);
        }

        if (queryParams.source) {
            let query: { [index: string]: any } = {};
            query['match'] = { 'source': queryParams.source };
            queryMust.push(query);
        }

        if (queryParams.destination) {
            let query: { [index: string]: any } = {};
            query['match'] = { 'destination': queryParams.destination };
            queryMust.push(query);
        }

        if (queryParams.status) {
            let query: { [index: string]: any } = {};
            query['match'] = { 'status': queryParams.status };
            queryMust.push(query);
        }

        if (queryParams.sort) {
            sortVal.push(JSON.parse(queryParams.sort as string));
            let sortParam = sortVal[0];
            for (let entry of sortParam) {
                if (entry.hasOwnProperty("timestamp")) {
                    deriveSort.push(entry)
                }
                if (entry.hasOwnProperty("action")) {
                    entry["action.keyword"] = entry["action"];
                    delete entry["action"];
                    deriveSort.push(entry);
                }
                if (entry.hasOwnProperty("type")) {
                    entry["type.keyword"] = entry["type"];
                    delete entry["type"];
                    deriveSort.push(entry);
                }
                if (entry.hasOwnProperty("source")) {
                    entry["source.keyword"] = entry["source"];
                    delete entry["source"];
                    deriveSort.push(entry);
                }
                if (entry.hasOwnProperty("destination")) {
                    entry["destination.keyword"] = entry["destination"];
                    delete entry["destination"];
                    deriveSort.push(entry);
                }
                if (entry.hasOwnProperty("status")) {
                    entry["status.keyword"] = entry["status"];
                    delete entry["status"];
                    deriveSort.push(entry);
                }
            }
        }

        //default to timestamp desc if no sort is provided
        if (deriveSort.length === 0) {
            deriveSort.push({ "timestamp": { "order": "desc" } })
        }

        let sort = deriveSort;
        let size = 100;
        if (req.query.resultsperpage) {
            size = parseInt((req.query as any).resultsperpage);
        }

        let pagenumber = 1;
        if (req.query.pagenumber) {
            pagenumber = parseInt((req.query as any).pagenumber);
        }

        let start = (pagenumber - 1) * size;

        let querySearch: { [index: string]: any } = {
            index: config.model,
            from: start,
            size: size,
            body: {
                "query": {
                    "bool": {}
                },
                sort: sort
            }
        };

        if (queryMust.length > 0) {
            querySearch.body.query.bool['must'] = queryMust;
        }

        if (queryFilter.length > 0) {
            querySearch.body.query.bool['filter'] = queryFilter;
        }

        await this._elasticSearchService.queryElastic(querySearch)
            .then((resp: any) => {
                res.status(200).send(resp);
            }).catch((error: any) => {
                let msg = ErrorService.reportError(organization_id, null, 4006, error.stack, null);
                res.status(500).send({ success: false, message: msg });
            }
            );
    }

    /**
     * Adds a new event to the search index
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    addEventToSearchIndex = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = req.params.orgId;
        try {
            if (!orgId) {
                res.status(400).send({ success: false, message: "orgId path parameter is required" });
                return;
            }

            if (req.body === undefined || !req.body.id) {
                res.status(400).send({ success: false, message: "No event data in request body" });
                return;
            }

            await this._elasticSearchService.indexData(req.body)
                .then((message: any) => {
                    res.status(200).send({ success: true, message: "Event added to search index" });
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4002, e.stack, null);
                    res.status(500).send({ success: false, message: msg });
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9000, error.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
    };

    /**
     * Gets a specific event from Elasticsearch
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getEventBasedOnID = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = req.params.orgId;
        try {
            if (!orgId) {
                res.status(400).send({ success: false, message: "orgId path parameter is required" });
                return;
            }

            let eventId = req.params.eventId;
            if (!eventId) {
                res.status(400).send({ success: false, message: "eventId path parameter is required" });
                return;
            }

            await this._elasticSearchService.getIdData(eventId).then((message: any) => {
                res.status(200).send(message);
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4008, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9001, error.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
    };

    /**
     * Updates a specific event in Elasticsearch
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateEventBasedOnID = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = req.params.orgId;
        try {
            if (!orgId) {
                res.status(400).send({ success: false, message: "orgId path parameter is required" });
                return;
            }

            let eventId = req.params.eventId;
            if (!eventId) {
                res.status(400).send({ success: false, message: "eventId path parameter is required" });
                return;
            }

            if (req.body === undefined) {
                res.status(400).send({ success: false, message: "No event data in request body" });
                return;
            }

            let event: any = req.body;
            event['id'] = eventId;

            await this._elasticSearchService.updateData(event, eventId).then((message: any) => {
                res.status(200).send({ success: true, message: "Record is updated into Elastic search index" });
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4009, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9002, error.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
    };

    /**
     *
     * @param req
     * @param res
     */
    deleteEventBasedOnID = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = req.params.orgId;
        try {
            if (!orgId) {
                res.status(400).send({ success: false, message: "orgId path parameter is required" });
                return;
            }

            let eventId = req.params.eventId;
            if (!eventId) {
                res.status(400).send({ success: false, message: "eventId path parameter is required" });
                return;
            }

            await this._elasticSearchService.deleteData(eventId).then((message: any) => {
                res.status(200).send({ success: true, message: "Record deleted in Elasticsearch index" });
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4010, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9003, error.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
    };

    /**
     *
     * @param req
     * @param res
     */
    deleteIndexFromElasticSearchDB = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            await this._elasticSearchService.deleteIndex().then((message: any) => {
                res.status(200).send({ success: true, message: "Deleted Elasticsearch index" });
            }).catch(e => {
                let msg = ErrorService.reportError(null, null, 4007, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
        } catch (error) {
            let msg = ErrorService.reportError(null, null, 9004, error.stack, null);
            res.status(500).send({ success: false, message: msg });
        }
    };

    /**
     * Sanitizes the input query params to make it searchable in elastic search.
     *
     * @param text - the incoming text containing special characters.
     */
    sanitizeQuery = async (text: string): Promise<string> => {
        //replace colon, percentage, accent in the id with a space.
        text = text.split(':').join(' ');
        text = text.split('%').join(' ');
        text = text.split('`').join(' ');
        //otherwise remove any of the other special chars
        text = text.split('\'').join('').split('"').join('');
        text = text.split('~').join('');
        text = text.split('/').join('');
        text = text.split('\\').join('');
        text = text.split('{').join('').split('}').join('');
        text = text.split('[').join('').split(']').join('');
        text = text.split('(').join('').split(')').join('');
        return text;
    }
}