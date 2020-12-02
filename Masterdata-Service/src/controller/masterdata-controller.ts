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
 * EPCIS MESSAGING HUB - MASTER DATA SERVICE

 */

import express from "express";
import path from "path";
import axios from "axios";
import { CommonUtils } from "../utils/common-utils";
import { PostgresService } from "../services/postgres-service";
import { RabbitMQProcessor } from "../processor/rabbit-mq-processor";
import { DataPrivacyRulesProcessor } from "../rules/data-privacy-rules-processor";
import { ErrorService } from "../services/error-service";
import { ServiceError } from "../errors/service-error";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

let xmlParser = require("libxmljs");
let validator = require('xsd-schema-validator');

let parser = require("fast-xml-parser");
var jp = require('jsonpath');

export class MasterDataController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();
    private _rabbitMQProcessor: RabbitMQProcessor = new RabbitMQProcessor();
    private _dataPrivacyRulesProcessor: DataPrivacyRulesProcessor = new DataPrivacyRulesProcessor();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        this._rabbitMQProcessor.start();

        //Data must be protected/owned by organization, so we have to know the organization id.
        //The Masterdata service will determine the client id from the OAuth JWK token and pass it as clientId
        //this path.

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
         *  MasterdataQueueProcessing:
         *    type: object
         *    properties:
         *      queue:
         *        type: string
         *        example: "masterdata-processor"
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
         *
         *  '/client/{clientId}/masterdata':
         *    post:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Provides a new master data to the hub"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.post("/client/:clientId/masterdata", this.postMasterDataForClient);

        /**
         * @swagger
         *
         *  '/client/{clientId}/masterdata/{masterdata_id}':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets an Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/client/:clientId/masterdata/:masterdata_id", this.getMasterdataForClient);

        /**
         * @swagger
         *
         *  '/client/{clientId}/masterdata':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets all Masterdata for client"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/client/:clientId/masterdata", this.getAllMasterdataForClient);

        /**
         * @swagger
         *
         *  '/organization/{orgId}/masterdata/{masterdata_id}':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets an Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/organization/:orgId/masterdata/:masterdata_id", this.getMasterdataForOrganization);

        /**
         * @swagger
         *
         *  '/organization/{orgId}/masterdata':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets all Masterdata for organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/organization/:orgId/masterdata", this.getAllMasterdataForOrganization);

        /**
         * @swagger
         *
         *  '/client/{clientId}/masterdata/{masterdata_id}/status':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets status of Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/client/:clientId/masterdata/:masterdata_id/status", this.getMasterdataStatusForClient);

        /**
         * @swagger
         *
         *  '/organization/{orgId}/masterdata/{masterdata_id}/blockchain/{bc_adapter_id}':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Gets Masterdata from the specified blockchain for specified id"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.get("/organization/:orgId/masterdata/:masterdataId/blockchain/:adapterId", this.getMasterdataFromBlockchain);

        /**
         * @swagger
         *
         *  '/organization/{orgId}/masterdata/{masterdata_id}':
         *    delete:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Deletes a Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.delete("/organization/:orgId/masterdata/:masterdata_id", this.deleteMasterdataForOrg);


        /**
         * @swagger
         *
         *  '/organization/{orgId}/masterdataqueuecount':
         *    get:
         *      tags:
         *        - "Masterdata API"
         *      summary: "gets the masterdata messages processing in Rabbit MQ."
         *      description: ""
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The orgId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MasterdataQueueProcessing'
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
        this.router.get("/organization/:orgId/masterdataqueuecount", this.getMasterdataQueueMessagesCount);
        /**
         * @swagger
         *
         *  '/client/{clientId}/masterdata/{masterdata_id}':
         *    delete:
         *      tags:
         *        - "Masterdata API"
         *      summary: "Deletes a Masterdata based on the masterdata_id"
         *      description: ""
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.delete("/client/:clientId/masterdata/:masterdata_id", this.deleteMasterdata);

        //metrics and config
        /**
         * @swagger
         *  /organization/{orgId}/masterdatasources:
         *    get:
         *      tags: ["Masterdata API"]
         *      summary: "Gets the Organization's unique masterdata sources"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Masterdata BFF from the caller's access token)"
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
        this.router.get("/organization/:orgId/masterdatasources", this.getDistinctMasterdataSourcesForOrganization);

        /**
         * @swagger
         *  /organization/{orgId}/masterdatadestinations:
         *    get:
         *      tags: ["Masterdata API"]
         *      summary: "Gets the Organization's unique masterdata destinations"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Masterdata BFF from the caller's access token)"
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
        this.router.get("/organization/:orgId/masterdatadestinations", this.getDistinctMasterdataDestinationsForOrganization);

        /**
         * @swagger
         *  /organization/{orgId}/masterdataretry:
         *    get:
         *      tags: ["Masterdata API"]
         *      summary: "Retry the failed masterdata messages from deadletter queue to processing queue in Rabbit MQ"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Masterdata BFF from the caller's access token)"
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
        this.router.get("/organization/:orgId/masterdataretry", this.retryMasterdataQueueMessagesDLX);

        /**
         * @swagger
         *  /organization/{orgId}/masterdatadlx/queuecount:
         *    get:
         *      tags: ["Masterdata API"]
         *      summary: "Gets the count of masterdata messages from deadletter queue in Rabbit MQ"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Masterdata BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/MasterdataQueueProcessing'
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
        this.router.get("/organization/:orgId/masterdatadlx/queuecount", this.getMasterdataDLXQueueMessagesCount);

        /**
         * @swagger
         *  /organization/{orgId}/masterdata/queuestatus:
         *    post:
         *      tags: ["Masterdata API"]
         *      summary: "Sets the masterdata queuestatus to pause/resume the processing queue."
         *      description: "User must have hub_admin role to perform this function"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization of the caller (obtained by the Masterdata BFF from the caller's access token)"
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
        this.router.post("/organization/:orgId/masterdata/queuestatus", this.setMasterdataQueueStatus);
    }

    /**
     * Accepts a masterdata posted to the API
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    postMasterDataForClient = async (req: express.Request, res: express.Response): Promise<void> => {

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
     * Attempts to parse the XML and checks the incoming masterdata against the schema
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

        await this.processMasterdata(orgId, clientId, source, xmlDoc, res);
    }

    /**
     * Wraps the XSD Parser in a Promise
     *
     * @param xmlPayload
     */
    private validateXMLAgainstSchema = async (xmlPayload: any): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            await validator.validateXML(xmlPayload, './assets/EPCglobal-epcis-masterdata-1_2.xsd', (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Processes an incoming master data
     *
     * @param orgId
     * @param clientId
     * @param source
     * @param xmlDoc
     * @param res
     */
    private processMasterdata = async (orgId: number, clientId: string, source: string, xmlDoc: any, res: express.Response): Promise<void> => {
        try {
            //this is a much better parser. namespace is required to retain certain extension element attributes in the Masterdata.
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

            //got to clone this to retain the original
            let clonedJSON = JSON.parse(JSON.stringify(json));
            await this._dataPrivacyRulesProcessor.redact(clonedJSON, xmlDoc, orgId);
            //we need to redact the saved data based on the data privacy rules
            let redactedJSON = clonedJSON;
            let redactedXML = xmlDoc.toString();
            if (redactedXML === '{"errors":[]}') {
                let msg = ErrorService.reportError(orgId, clientId, 4020, redactedXML, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }

            //create id
            let masterDataId = commonUtils.generateID();

            var masterDataTime: string;

            //current system date
            masterDataTime = new Date().toISOString();

            const result = await this._postgresService.getMasterdataQueueStatus();
            if (result.rowCount > 0) {
                const data = result.rows[0];
                if (data.masterdata_paused) {
                    //save to database
                    await this._postgresService.insertMasterData(masterDataId, masterDataTime, clientId, orgId, source, "processing", redactedXML, JSON.stringify(redactedJSON));
                    //put on the holding queue (use the non-redacted JSON since this full message needs to go to the blockchain)
                    await this._rabbitMQProcessor.publishMasterdataHoldingQueue(JSON.stringify(json), masterDataId, clientId, orgId);
                    //return the response with the status callback url.
                    let callbackUrl = process.env.MASTERDATA_BFF + '/masterdata/' + masterDataId + '/status';
                    res.status(200).send({ success: true, message: "Processing", "callback": callbackUrl });
                    return;
                }
            }
            //save to database
            await this._postgresService.insertMasterData(masterDataId, masterDataTime, clientId, orgId, source, "accepted", redactedXML, JSON.stringify(redactedJSON));
            //put on the processing queue (use the non-redacted JSON since this full message needs to go to the blockchain)
            await this._rabbitMQProcessor.publishMasterdata(JSON.stringify(json), masterDataId, clientId, orgId);

            //return the response with the status callback url.
            let callbackUrl = process.env.MASTERDATA_BFF + '/masterdata/' + masterDataId + '/status';
            res.status(200).send({ success: true, message: "Accepted", "callback": callbackUrl });
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
     * Calls the Postgres service to get master data based on the supplied
     * master data id and the caller's organization/client credentials
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataForClient = async (req: express.Request, res: express.Response): Promise<void> => {

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

        await this._postgresService.getMasterdataForOrganization(orgId, req.params.masterdata_id)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    let data = result.rows[0];
                    this._postgresService.getDestinationsForMasterdata(data.id).then(result => {
                        if (result.rowCount > 0) {
                            data.destinations = result.rows;
                        } else {
                            data.destinations = [];
                        }
                        res.status(200).send(data);
                    });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Postgres service to get master data based on the supplied
     * master data id and the caller's organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getMasterdataForOrganization(orgId, req.params.masterdata_id)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    let data = result.rows[0];
                    this._postgresService.getDestinationsForMasterdata(data.id).then(result => {
                        if (result.rowCount > 0) {
                            data.destinations = result.rows;
                        } else {
                            data.destinations = [];
                        }
                        res.status(200).send(data);
                    });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Postgres service to get all master data based on the caller's organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAllMasterdataForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getAllMasterdataForOrganization(orgId)
            .then(async (result) => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    let data = result.rows;
                    let finalData: any = [];
                    for (let i = 0; i < data.length; i++) {
                        const destMasterdata = await this._postgresService.getDestinationsForMasterdata(data[i].id).then(result => {
                            if (result.rowCount > 0) {
                                data[i].destinations = result.rows;
                            } else {
                                data[i].destinations = [];
                            }
                            return data[i];
                        });
                        finalData.push(destMasterdata);
                    }
                    res.status(200).send(finalData);
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Postgres service to get all master data based on the caller's client id
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAllMasterdataForClient = async (req: express.Request, res: express.Response): Promise<void> => {
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

        await this._postgresService.getAllMasterdataForOrganization(orgId)
            .then(async (result) => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    let data = result.rows;
                    let finalData: any = [];
                    for (let i = 0; i < data.length; i++) {
                        const destMasterdata = await this._postgresService.getDestinationsForMasterdata(data[i].id).then(result => {
                            if (result.rowCount > 0) {
                                data[i].destinations = result.rows;
                            } else {
                                data[i].destinations = [];
                            }
                            return data[i];
                        });
                        finalData.push(destMasterdata);
                    }
                    res.status(200).send(finalData);
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Postgres service to delete master data based on the supplied master data id  and org id
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteMasterdataForOrg = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = parseInt(req.params.orgId);

        await this._postgresService.deleteMasterdata(orgId, req.params.masterdata_id)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    res.status(200).send({ success: true, message: "master data is deleted" });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4001, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
    * Calls the Postgres service to delete master data based on the supplied master data id 
    * @param req - the incoming request
    * @param res - the outgoing response
    */
    deleteMasterdata = async (req: express.Request, res: express.Response): Promise<void> => {
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
        await this._postgresService.deleteMasterdata(orgId, req.params.masterdata_id)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    res.status(200).send({ success: true, message: "master data is deleted" });
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4001, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });

    }

    /**
     * Calls the Rabbit mq to get the count of messages in Masterdata queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataQueueMessagesCount = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        try {
            let result: any = await this._rabbitMQProcessor.getMasterdataQueueMessagesCount();
            const holdingqueueResult: any = await this._rabbitMQProcessor.getMasterdataHoldingQueueMessagesCount();
            result.messageCount = result.messageCount + holdingqueueResult.messageCount;
            result.consumerCount = result.consumerCount + holdingqueueResult.consumerCount;
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }


    /**
     * Calls the Rabbit mq to get the count of messages in Masterdata Deadletter queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataDLXQueueMessagesCount = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._rabbitMQProcessor.getMasterdataDLXQueueMessagesCount();
            res.status(200).send(result);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }

    /**
     * Calls the Postgres service to get the status for a master data based on the supplied
     * master data id and the caller's organization/client credentials
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getMasterdataStatusForClient = async (req: express.Request, res: express.Response): Promise<void> => {

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

        this._postgresService.getMasterdataStatusForOrganization(orgId, req.params.masterdata_id)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).send({ success: false, message: "no master data found" });
                } else {
                    res.status(200).send(result.rows[0]);
                }
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4004, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }


    /**
     * Gets the Event information from the blockchain by calling the adapter
     * @param req
     * @param res
     */
    getMasterdataFromBlockchain = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        let adapterId = req.params.adapterId;
        let masterdataId = req.params.masterdataId;

        //first ensure the masterdata id is valid and it belongs to the organization
        try{
            let status = await this._postgresService.getMasterdataStatusForOrganization(orgId, req.params.masterdataId);
            if( status.rowCount == 0 ){
                res.status(404).send({ "success": false, "message": "no masterdata found" });
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
        await axios.get(serviceURI + "/adapter/organization/" + orgId + "/masterdata/"+ masterdataId)
            .then(result => {
                res.status(result.status).send(result.data);
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(orgId, null, 4021, error.stack, [req.params.masterdataId, req.params.adapterId, orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4021, error.stack, [req.params.masterdataId, req.params.adapterId, orgId, error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            }
        );
    }

    /**
     * Calls the Postgres service to get distinct master data sources for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDistinctMasterdataSourcesForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {
        let orgId = parseInt(req.params.orgId);

        this._postgresService.getDistinctMasterdataSourcesForOrganization(orgId)
            .then(result => {
                let values = [];
                for (var i = 0; i < result.rowCount; i++) {
                    values.push(result.rows[i].source);
                }
                res.status(200).send(values);
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4005, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Postgres service to get distinct master data destinations for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDistinctMasterdataDestinationsForOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);

        await this._postgresService.getDistinctMasterdataDestinationsForOrganization(orgId)
            .then(result => {
                let values = [];
                for (var i = 0; i < result.rowCount; i++) {
                    values.push(result.rows[i].destination);
                }
                res.status(200).send(values);
            })
            .catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4006, e.stack, null);
                res.status(500).send({ success: false, message: msg });
            });
    }

    /**
     * Calls the Rabbit mq to retry failed masterdata messages from deadletter queue
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    retryMasterdataQueueMessagesDLX = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId = parseInt(req.params.orgId);
        try {
            let masterdata_paused: boolean = false;
            const result = await this._postgresService.getMasterdataQueueStatus();
            if (result.rowCount > 0) {
                const data = result.rows[0];
                masterdata_paused = data.masterdata_paused;
            }
            const response = await this._rabbitMQProcessor.retryMessagesFromDLX(masterdata_paused);
            res.status(200).send(response);
        } catch (err) {
            let msg = ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
    }

    /**
     * Set the masterdata queue status to pause/resume the processing queue.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    setMasterdataQueueStatus = async (req: express.Request, res: express.Response): Promise<void> => {
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
        await this._postgresService.setMasterdataQueueStatus(events_paused, masterdata_paused, updated_by)
            .then(result => {
                if (result.rowCount > 0) {
                    let data = result.rows[0];
                    if (!data.masterdata_paused) {
                        this._rabbitMQProcessor.consumeMasterdataHoldingQueue().catch((err) => {
                            ErrorService.reportError(orgId, null, err.errorCode, err.stack, null);
                        });
                    }
                }
                res.status(200).send(result.rows[0]);
            }).catch(e => {
                let msg = ErrorService.reportError(orgId, null, 4018, e.stack, null);
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
        return axios.get(process.env.ORGANIZATION_SERVICE + '/organizations/', options);
    }

}