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
 * EPCIS MESSAGING HUB - ROUTING RULES SERVICE

 */

import express from "express";
import path from "path";

import {CommonUtils} from "../utils/common-utils";
import {PostgresService} from "../services/postgres-service"
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

export class RoutingRulesController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();

    constructor() {
        /**
         * @swagger
         *
         * definitions:
         *   200Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: true
         *       message:
         *         type: string
         *         example: "Success"
         *   400Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "Missing or Invalid parameters/request body"
         *   500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
         *   routingRule:
         *     type: object
         *     properties:
         *       id:
         *         type: number
         *         example: 74
         *       organization_id:
         *         type: number
         *         example: 3
         *       data_field:
         *         type: number
         *         example: 1
         *       datafield_type:
         *         type: string
         *         example: "OBJECT"
         *       datafield_display:
         *         type: string
         *         example: "Object Event: SGTIN"
         *       datafield_path:
         *         type: string
         *         example: "$.epcisbody.eventlist.objectevent.epclist.epc"
         *       datafield_prefix:
         *         type: string
         *         example: "urn:epc:id:sgtin:"
         *       comparator:
         *         type: number
         *         example: 3
         *       comparator_operation:
         *         type: string
         *         example: "isLike"
         *       comparator_display:
         *         type: string
         *         example: "is like (wildcard *)"
         *       value:
         *         type: string
         *         example: "8888555.600301.*"
         *       destinations:
         *         type: array
         *         items: string
         *         example: ["mock-adapter"]
         *       order:
         *         type: number
         *         example: 1
         *   routingRuleList:
         *     type: array
         *     items:
         *       $ref: "#/definitions/routingRule"
         *   routingRuleDataField:
         *     type: object
         *     properties:
         *        id:
         *          type: number
         *          example: 5
         *        path:
         *          type: string
         *          example: "$.epcisbody.eventlist.aggregationevent.childepcs.epc"
         *        display_name:
         *          type: string
         *          example: "Aggregation Event: STGIN"
         *        value_prefix:
         *          type: string
         *          example: "urn:epc:id:sgtin:"
         *        data_type:
         *          type: string
         *          example: "AGGREGATION"
         *   routingRuleDataFieldList:
         *     type: array
         *     items:
         *       $ref: "#/definitions/routingRuleDataField"
         *   routingRuleComparator:
         *     type: object
         *     properties:
         *       id:
         *         type: number
         *         example: 5
         *       operation:
         *         type: string
         *         example: "equal"
         *       display_name:
         *         type: string
         *         example: "Is equal to"
         *   routingRuleComparatorList:
         *     type: array
         *     items:
         *       $ref: "#/definitions/routingRuleComparator"
         *   routingRuleDestination:
         *     type: object
         *     properties:
         *       id:
         *         type: number
         *         example: 5
         *       service_name:
         *         type: string
         *         example: "mock-adapter"
         *       display_name:
         *         type: string
         *         example: "Mock Adapter"
         *       active:
         *         type: boolean
         *         example: true
         *   routingRuleDestinationList:
         *     type: array
         *     items:
         *       $ref: "#/definitions/routingRuleDestination"
         *   routingRulesHistory:
         *     type: object
         *     properties:
         *       rules_id:
         *         type: number
         *         example: 77
         *       change_description:
         *         type: string
         *         example: "CREATED"
         *       editor:
         *         type: string
         *         example: "someone@hub.com"
         *       timestamp:
         *         type: string
         *         example: "2020-08-14T16:15:54.968Z"
         *       datafield_type:
         *         type: string
         *         example: "OBJECT"
         *       new_datafield_display:
         *         type: string
         *         example: "Object Event: SGTIN"
         *       new_comparator_display:
         *         type: string
         *         example: "is like (wildcard *)"
         *       new_value:
         *         type: string
         *         example: "*"
         *       new_destinations:
         *         type: string
         *         example: ["mock-adapter","mock-adapter-two"]
         *       new_order:
         *         type: number
         *         example: 3
         *   routingRulesHistoryList:
         *     type: array
         *     items:
         *       $ref: "#/definitions/routingRulesHistory"
         */

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets all of the routing rules for the user's organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRuleList'
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/routingrules", this.getAllRoutingRulesForOrganization);

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules/history:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets the routing rules history (audit log) for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRulesHistoryList'
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/routingrules/history", this.getRoutingRulesHistory);

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules:
         *    post:
         *      tags: ["Routing Rules API"]
         *      summary: "Creates a new routing rules for the user's organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRule'
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.post("/organization/:orgId/routingrules", this.createRoutingRule);

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules/{ruleId}:
         *    gets:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets a routing rule by id for the user's organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: ruleId
         *          in: path
         *          description: "The rule's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRule'
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organization/:orgId/routingrules/:ruleId", this.getRoutingRule);

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules/{ruleId}:
         *    patch:
         *      tags: ["Routing Rules API"]
         *      summary: "Updates a routing rule by id for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: ruleId
         *          in: path
         *          description: "The rule's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                data_field:
         *                  type: number
         *                  example: 1
         *                comparator:
         *                  type: number
         *                  example: 3
         *                value:
         *                  type: string
         *                  example: "some value to match"
         *                destinations:
         *                  type: array
         *                  items: string
         *                  example: ["mock-adapter","mock-adapter-two"]
         *                order:
         *                  type: number
         *                  example: 2
         *                editor:
         *                  type: string
         *                  example: "someone@hub.com"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRule'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.patch("/organization/:orgId/routingrules/:ruleId", this.updateRoutingRule);

        /**
         * @swagger
         *
         *  /organization/{orgId}/routingrules/{ruleId}:
         *    delete:
         *      tags: ["Routing Rules API"]
         *      summary: "Deletes a routing rule by id for the user's organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *        - name: ruleId
         *          in: path
         *          description: "The rule's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.delete("/organization/:orgId/routingrules/:ruleId", this.deleteRoutingRule);

        /**
         * @swagger
         *  /organization/{orgId}/routingrules:
         *    patch:
         *      tags: ["Routing Rules API"]
         *      summary: "Reorders the routing rules for the user's organization"
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
         *              type: object
         *              properties:
         *                rulesordered:
         *                  type: array
         *                  items: number
         *                  example: [74,77,75]
         *                editor:
         *                  type: string
         *                  example: someone@hub.com
         *      responses:
         *        200:
         *          description: "Reordered"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        400:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/400Response'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.patch("/organization/:orgId/routingrules", this.updateRoutingRulesOrdering);

        /**
         * @swagger
         *
         *  /routingrules/config/datafields:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets the configured routing rules data fields"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: "#/definitions/routingRuleDataFieldList"
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get('/routingrules/config/datafields', this.getDataFields );

        /**
         * @swagger
         *
         *  /routingrules/config/comparators:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets the configured routing rules comparators"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: "#/definitions/routingRuleComparatorList"
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get('/routingrules/config/comparators', this.getComparators );

        /**
         * @swagger
         *
         *  /routingrules/config/destinations:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets the configured routing rules destinations"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: "#/definitions/routingRuleDestinationList"
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        500:
         *          description: "Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get('/routingrules/config/destinations', this.getAdapters );
    }

    /**
     * Gets a list of configured data fields from the database
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getDataFields = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await this._postgresService.getDataFields()
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({"success": false, "message": "no routing rules data fields found"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(null, null, 4001, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9001, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a list of configured comparators from the database
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getComparators = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await this._postgresService.getComparators()
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({"success": false, "message": "no routing rules comparators found"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(null, null, 4002, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9002, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a list of configured adapters from the database
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getAdapters = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await this._postgresService.getAdapters()
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({"success": false, "message": "no routing rules destinations found"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(null, null, 4003, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9003, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets all of the routing rules for an organization
     *
     * @param req
     * @param res
     */
    getAllRoutingRulesForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            await this._postgresService.getAllRulesForOrganization(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({"success": false, "message": "no routing rules found"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4004, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9004, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Creates a new routing rule
     *
     * @param req
     * @param res
     */
    createRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);

        let dataField = req.body.data_field;
        if (!dataField) {
            res.status(400).send({"success": false, "message": "Missing data_field in request"});
            return false;
        }
        let comparator = req.body.comparator;
        if (!comparator) {
            res.status(400).send({"success": false, "message": "Missing comparator in request"});
            return false;
        }

        let value = req.body.value;
        if (!value || value.length == 0) {
            res.status(400).send({"success": false, "message": "Missing or empty value in request"});
            return false;
        }

        let destinations = req.body.destinations;
        if (!destinations || destinations.length == 0) {
            res.status(400).send({"success": false, "message": "Missing or empty destinations in request"});
            return false;
        }

        let order = req.body.order;
        if (!order) {
            res.status(400).send({"success": false, "message": "Missing order in request"});
            return false;
        }

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({"success": false, "message": "Missing editor in request"});
            return false;
        }

        try {
            //save to database
            await this._postgresService.createRoutingRule(orgId, dataField, comparator, value, destinations, order, editor)
                .then(result => {
                    res.status(200).send(result.rows[0])
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4005, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9005, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a particular routing rule based on its ID
     *
     * @param req
     * @param res
     */
    getRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);

        try {
            await this._postgresService.getRoutingRule(orgId, ruleId)
                .then(result => {
                    if( result.rows.length >0 ) {
                        res.status(200).send(result.rows[0]);
                    }else{
                        res.status(404).send({"success": false, "message": "no rule found with that id"});
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4006, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9006, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Updates a rule in the database
     *
     * @param req
     * @param res
     */
    updateRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);

        let dataField = req.body.data_field;
        if (!dataField) {
            res.status(400).send({"success": false, "message": "Missing data_field in request"});
            return false;
        }
        let comparator = req.body.comparator;
        if (!comparator) {
            res.status(400).send({"success": false, "message": "Missing comparator in request"});
            return false;
        }

        let value = req.body.value;
        if (!value || value.length == 0) {
            res.status(400).send({"success": false, "message": "Missing or empty value in request"});
            return false;
        }

        let destinations = req.body.destinations;
        if (!destinations || destinations.length == 0) {
            res.status(400).send({"success": false, "message": "Missing or empty destinations in request"});
            return false;
        }

        let order = req.body.order;
        if (!order) {
            res.status(400).send({"success": false, "message": "Missing order in request"});
            return false;
        }

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({"success": false, "message": "Missing editor in request"});
            return false;
        }

        try {
            //update the database
            await this._postgresService.updateRoutingRule(orgId, ruleId, dataField, comparator, value, destinations, order, editor)
                .then(result => {
                    res.status(200).send(result.rows[0])
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4007, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9007, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Updates the ordering of a list of routing rules
     *
     * @param req
     * @param res
     */
    updateRoutingRulesOrdering = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);

        let ruleList= req.body.rulesordered;
        if (!ruleList) {
            res.status(400).send({"success": false, "message": "Missing rulesordered in request"});
            return false;
        }

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({"success": false, "message": "Missing editor in request"});
            return false;
        }

        try {
            //update the database
            await this._postgresService. updateRoutingRulesOrdering(orgId, ruleList, editor);
            res.status(200).send({"success": true, "message": "rules reordered"});
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 4008, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }


    /**
     * Deletes a routing rule (changes the status to DELETED)
     *
     * @param req
     * @param res
     */
    deleteRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({"success": false, "message": "Missing editor in request"});
            return false;
        }

        try {
            //delete from the database
            await this._postgresService.deleteRoutingRule(orgId, ruleId, editor)
                .then(result => {
                    res.status(200).send({"success": true, "message": "rule deleted"});
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4009, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9008, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets the Routing Rules History
     *
     * @param req
     * @param res
     */
    getRoutingRulesHistory = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            await this._postgresService.getAuditHistory(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({"success": false, "message": "no audit history found"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4010, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
            );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9009, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }
}
