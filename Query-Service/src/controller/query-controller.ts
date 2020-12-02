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
 * EPCIS MESSAGING HUB - QUERY SERVICE

 */

import express from "express";
import path from "path";
import axios from "axios";
import { CommonUtils } from "../utils/common-utils";
import { ErrorService } from "../services/error-service";
import { ServiceError } from "../errors/service-error";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

let xmlParser = require("libxmljs");
let validator = require('xsd-schema-validator');
let parser = require("fast-xml-parser");
let Parser = require('fast-xml-parser').j2xParser;
let jp = require('jsonpath');

/**
 * This is the main controller for the Query microservice.
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
         *  EPCISDocument:
         *    type: object
         *    properties:
         *      EPCISBody:
         *        type: object
         *        properties:
         *          epcisq:Poll:
         *            type: object
         *            properties:
         *              queryName:
         *                type: string
         *                example: "SimpleEventQuery"
         *              params:
         *                type: object
         *                properties:
         *                  param:
         *                    type: object
         *                    properties:
         *                      name:
         *                        type: string
         *                        example: eventType
         *                      value:
         *                        type: object
         *                        properties:
         *                          string:
         *                            type: string
         *                            example: ObjectEvent
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
         *  '/client/{clientId}/queries':
         *    post:
         *      tags: ["Queries API"]
         *      summary: "Adds a query to the processing queue"
         *      parameters:
         *        - name: clientId
         *          in: path
         *          description: "The clientId of the calling service (obtained by the Query BFF from the caller's access token)"
         *          required: true
         *          schema:
         *            type: string
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
        this.router.post("/client/:clientId/queries", this.postQueryForClient);
    }

    /**
     * Accepts an query posted to the API
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    postQueryForClient = async (req: express.Request, res: express.Response): Promise<void> => {

        let orgId;
        let source;
        let clientId = req.params.clientId;

        try {
            let response = await this.getOrganizationForClientId(req);
            orgId = response.data.organization_id;
            source = response.data.source_name;
        } catch (e) {
            let msg = ErrorService.reportError(orgId, clientId, 4004, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
            return;
        }

        await this.checkPayload(orgId, clientId, source, req, res);
    }

    /**
     * Attempts to parse the XML and hecks the incoming query against the schema
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

        await this.processQuery(orgId, clientId, source, xmlDoc, res, xmlPayload);
    }

    /**
     * Wraps the XSD Parser in a Promise
     *
     * @param xmlPayload
     */
    private validateXMLAgainstSchema = async (xmlPayload: any): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            await validator.validateXML(xmlPayload, './assets/EPCglobal-epcis-query-1_2.xsd', (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Processes an incoming query
     *
     * @param orgId
     * @param clientId
     * @param source
     * @param xmlDoc
     * @param res
     */
    private processQuery = async (orgId: number, clientId: string, source: string, xmlDoc: any, res: express.Response, xmlPayload: any): Promise<void> => {
        try {
            //this is a much better parser. namespace is required to prepare the query results xml as the response.
            let json = parser.parse(xmlDoc.toString(), {
                arrayMode: false,
                ignoreNameSpace: false,
                ignoreAttributes: false,
                trimValues: true,
                attributeNamePrefix: '',
                attrNodeName: '',
                textNodeName: 'value',
                parseNodeValue: false
            });
            //let's use json paths to make this easier
            const queryName = jp.value(json, '$..queryName');
            if (!queryName || queryName === '') {
                let msg = ErrorService.reportError(orgId, clientId, 1002, null, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }
            const queryParamsList = jp.nodes(json, '$..params.*');
            if (Array.isArray(queryParamsList) && queryParamsList.length === 0) {
                let msg = ErrorService.reportError(orgId, clientId, 1003, null, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }
            const queryParams = jp.value(json, '$..params.*');
            let queryParamObject: any = {};
            if (Array.isArray(queryParams) && queryParams.length > 0) {
                for (let i = 0; i < queryParams.length; i++) {
                    const key = queryParams[i].name;
                    const valueJson = queryParams[i].value;
                    const valueKey = Object.keys(valueJson)[0];
                    const value = valueJson[valueKey];
                    // Get the query params and prepare the query param which matches elastic search attributes present to search upon.
                    const queryParam = await this.getQueryParams(orgId, clientId, key, value);
                    if (Object.keys(queryParam).length > 0) {
                        const queryKey = Object.keys(queryParam)[0];
                        queryParamObject[queryKey] = queryParam[queryKey];
                    }
                }
            } else {
                const key = queryParams.name;
                const valueJson = queryParams.value;
                const valueKey = Object.keys(valueJson)[0];
                const value = valueJson[valueKey];
                // Get the query param and prepare the query param which matches elastic search attribute present to search upon.
                const queryParam = await this.getQueryParams(orgId, clientId, key, value);
                if (Object.keys(queryParam).length > 0) {
                    const queryKey = Object.keys(queryParam)[0];
                    queryParamObject[queryKey] = queryParam[queryKey];
                }
            }

            if (Object.keys(queryParamObject).length === 0) {
                let msg = ErrorService.reportError(orgId, clientId, 1004, null, null);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }
            // Query search service with query params object
            const searchResponse = await this.querySearchService(orgId, queryParamObject);
            let eventResponse: any = [];
            let xmlResponse: any = [];

            if (searchResponse.totalResults > 0 && searchResponse.results.length > 0) {
                const results = searchResponse.results;
                // Query the event serice for the matched event ids and get the redacted/saved xml/json.
                for (let j = 0; j < results.length; j++) {
                    const response = await this.queryEventService(orgId, results[j].id);
                    if (response.json_data) {
                        eventResponse.push(response.json_data);
                        xmlResponse.push(response.xml_data);
                    }
                }
            } else {
                res.status(200).send({ "success": false, "message": "No events match for the query params provided in the Query XML." });
                return;
            }
            if (eventResponse.length === 0) {
                let msg = ErrorService.reportError(orgId, clientId, 4005, null, [orgId]);
                res.status(400).send({ "success": false, "message": msg });
                return;
            }
            // Send the saved/redacted jsons to prepare the final query results xml and send the result xml as response
            const respXML = await this.prepareQueryResponseXML(eventResponse, xmlResponse, queryName);
            res.status(200).send(respXML);
        } catch (e) {
            if (e instanceof ServiceError) {
                let msg = ErrorService.reportError(orgId, clientId, e.errorCode, e.stack, [orgId, e.message]);
                res.status(400).send({ "success": false, "message": msg });
            } else {
                let msg = ErrorService.reportError(orgId, clientId, 9000, e.stack, e.message);
                res.status(400).send({ "success": false, "message": msg });
            }
        }
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

    /**
     * Gets the query params which needs to queried to elastic search apis.
     *
     * @param orgId
     * @param clientId
     * @param key
     * @param value
     */
    public getQueryParams = async (orgId: any, clientId: any, key: any, value: any) => {

        let jsonObj: any = {};
        if (!value || value === undefined || value === null) {
            ErrorService.reportError(orgId, clientId, 1006, null, key);
            return jsonObj;
        }
        // For these query params in request, send the corresponding search attribute/key and updated value back
        switch (key) {
            case 'eventType': jsonObj.type = value.toLowerCase().replace('event', '');
                break;
            case 'MATCH_epc':
            case 'MATCH_anyEPC': jsonObj.text = value;
                break;
            case 'EQ_action': jsonObj.action = value.toLowerCase();
                break;
            case 'GE_eventTime': jsonObj.startdate = value;
                break;
            case 'LT_eventTime': jsonObj.enddate = value;
                break;
            default: ErrorService.reportError(orgId, clientId, 1005, null, key);
                break;
        }
        return jsonObj;
    }

    /**
     * Call search service api with the query params options to get back the matched event ids.
     *
     * @param orgId
     * @param queryParamObject
     */
    public querySearchService = async (orgId: any, queryParamObject: any) => {
        try {
            const options = {
                params: queryParamObject
            };
            //call the search service
            const response = await axios.get(process.env.SEARCH_SERVICE + '/search/organizations/' + orgId + '/events', options);
            return response.data;
        } catch (e) {
            throw new ServiceError(e, 4001);
        }
    }

    /**
     * Call event service api to get the xml/json value for the event id
     *
     * @param orgId
     * @param queryParamObject
     */
    public queryEventService = async (orgId: any, eventId: any) => {
        try {
            //call the event service
            const response = await axios.get(process.env.EVENT_SERVICE + '/organization/' + orgId + '/events/' + eventId);
            return response.data;
        } catch (e) {
            throw new ServiceError(e, 4002);
        }
    }

    /**
     * Construct the query results xml with the event list objects and validate it with the query schema xsd and return the xml
     *
     * @param eventResponse
     * @param xmlResponse
     * @param queryName
     */
    public prepareQueryResponseXML = async (eventResponse: any, xmlResponse: any, queryName: any) => {
        try {
            let queryXml: any = {};
            let epcisBody: any = {};
            let epcisDocMap = new Map();
            let epcisDocValue = 'epcis:EPCISDocument';
            // Prepare the epcis Body with query results
            epcisBody['epcisq:QueryResults'] = { 'queryName': queryName, 'resultsBody': {} };
            // Prepare the EventList in query results which should contain the matching Event type values.
            let eventTypes: any = {};
            for (let i = 0; i < eventResponse.length; i++) {
                let eventTypeList = [];
                const eventJson = JSON.parse(eventResponse[i])
                if (eventJson['n0:EPCISDocument'])
                    epcisDocValue = 'n0:EPCISDocument';
                // Dynamically fetch the namespaces present in the event documents of the event xml to prepare the query results.
                // put all the namespace in the map to skip the repeated definitions which will lead to error in query result xml.
                if (eventJson[epcisDocValue] && Object.keys(eventJson[epcisDocValue]).length > 0) {
                    const keys = Object.keys(eventJson[epcisDocValue]);
                    for (let x = 0; x < keys.length; x++) {
                        // Fetch only the namespaces/definitions to insert it into query result headers
                        if (typeof eventJson[epcisDocValue][keys[x]] === 'string') {
                            epcisDocMap.set(keys[x], eventJson[epcisDocValue][keys[x]])
                        }
                    }
                }
                const eventList = jp.value(eventJson, '$..EventList');
                if (Object.keys(eventList).length > 0) {
                    const eventType = Object.keys(eventList)[0];
                    // Fetch the core eventlist part containing the requried event xml data
                    const eventTypeInitial = '<' + eventType + '>';
                    const eventTypeEnd = '</' + eventType + '>';
                    let partialSplit = xmlResponse[i].split(eventTypeEnd)[0].trim();
                    let eventValue = partialSplit.split(eventTypeInitial)[1];
                    // Check if already 'eventType' is present in json, if present update the array with the new event xml value.
                    if (eventValue !== undefined && eventTypes[eventType]) {
                        let eventarray = eventTypes[eventType];
                        eventarray.push(eventValue);
                    } else if (eventValue !== undefined) {
                        // if not present, push the event xml value which is first value.
                        eventTypeList.push(eventValue);
                        eventTypes[eventType] = eventTypeList;
                    }
                }
            }
            // Add event type results to the EventList and update query XML json
            epcisBody['epcisq:QueryResults']['resultsBody']['EventList'] = eventTypes;
            queryXml['EPCISBody'] = epcisBody;
            // parse the query json to query xml
            let parser = new Parser();
            let xml = parser.parse(queryXml);

            // Construct the initial part of query result xml and add the namespaces required for the event data to pass.
            let epcisDoc = `<?xml version="1.0" encoding="UTF-8"?><` + epcisDocValue + ` `;
            for (let entry of epcisDocMap) {
                epcisDoc = epcisDoc + entry[0] + "=\"" + entry[1] + "\" ";
            }
            epcisDoc = epcisDoc.trim() + ">";
            // Update the epcis query results attribute with 'epcis-query:xsd' to validate successfully against query xsd schema.
            let xmlEdit = xml.split('<queryName>');
            let xmlEdit2 = xmlEdit[0].substring(0, xmlEdit[0].length - 1);
            xml = xmlEdit2 + ' xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1"><queryName>' + xmlEdit[1];

            // Final closure of the xml.
            xml = epcisDoc + xml + '</' + epcisDocValue + '>';
            // Validate the query results xml against query xsd schema.
            await this.validateXMLAgainstSchema(xml);
            // Return the proper and validated query results xml with the EventList.
            return xml;
        } catch (e) {
            throw new ServiceError(e, 4003);
        }
    }
}