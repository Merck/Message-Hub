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
import {AdministrationController} from "./administration-controller";
import {AdministrationOrganizationController} from "./administration-organization-controller";
import { ErrorService } from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationRoutingRulesController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         * definitions:
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
         *  /admin/routingrules:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets all of the routing rules for the user's organization"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRuleList'
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
        this.router.get("/routingrules", this.getRoutingRules);

        /**
         * @swagger
         *
         *  /admin/routingrules/history:
         *    get:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets the routing rules history (audit log) for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRulesHistoryList'
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
        this.router.get("/routingrules/history", this.getRoutingRuleHistory);

        /**
         * @swagger
         *
         *  /admin/routingrules/config/datafields:
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
        this.router.get("/routingrules/config/datafields", this.getRoutingRuleDataFieldsConfig);

        /**
         * @swagger
         *
         *  /admin/routingrules/config/comparators:
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
        this.router.get("/routingrules/config/comparators", this.getRoutingRuleComparatorsConfig);

        /**
         * @swagger
         *
         *  /admin/routingrules/config/destinations:
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
        this.router.get("/routingrules/config/destinations", this.getRoutingRuleDestinationsConfig);

        /**
         * @swagger
         *
         *  /admin/routingrules:
         *    post:
         *      tags: ["Routing Rules API"]
         *      summary: "Creates a new routing rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      responses:
         *        200:
         *          description: "Success"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/routingRule'
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
        this.router.post("/routingrules", this.createRoutingRules);

        /**
         * @swagger
         *
         *  /admin/routingrules/{ruleId}:
         *    gets:
         *      tags: ["Routing Rules API"]
         *      summary: "Gets a routing rule by id for the user's organization"
         *      parameters:
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
        this.router.get("/routingrules/:ruleId", this.getRoutingRule);

        /**
         * @swagger
         *
         *  /admin/routingrules/{ruleId}:
         *    patch:
         *      tags: ["Routing Rules API"]
         *      summary: "Updates a routing rule by id for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
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
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.patch("/routingrules/:ruleId", this.updateRoutingRule);

        /**
         * @swagger
         *
         *  /admin/routingrules/{ruleId}:
         *    delete:
         *      tags: ["Routing Rules API"]
         *      summary: "Deletes a routing rule by id for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
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
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.delete("/routingrules/:ruleId", this.deleteRoutingRule);

        /**
         * @swagger
         *  /admin/routingrules:
         *    patch:
         *      tags: ["Routing Rules API"]
         *      summary: "Reorders the routing rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
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
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        500:
         *          description: "Bad Request"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.patch("/routingrules", this.updateRoutingRulesOrdering);
    }

    /**
     * Gets a list of configured Data Fields for use in routing rules
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getRoutingRuleDataFieldsConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await axios.get(process.env.ROUTING_RULES_SERVICE + '/routingrules/config/datafields')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, null, 4086, error.stack, [JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, null, 4087, error.stack, [error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9038, e.stack, [e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a list of configured Comparators for use in routing rules
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getRoutingRuleComparatorsConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await axios.get(process.env.ROUTING_RULES_SERVICE + '/routingrules/config/comparators')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, null, 4088, error.stack, [JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, null, 4089, error.stack, [error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9039, e.stack, [e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a list of configured Destinations (blockchain adapters) for use in routing rules
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getRoutingRuleDestinationsConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await axios.get(process.env.ROUTING_RULES_SERVICE + '/routingrules/config/destinations')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(null, null, 4090, error.stack, [JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(null, null, 4091, error.stack, [error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9040, e.stack, [e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets the All Routing rules for the user's organization using the routing-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getRoutingRules = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.ROUTING_RULES_SERVICE + '/organization/' + orgId + '/routingrules')
                .then((response) => {
                        res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4092, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4093, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9041, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * creating new rule using the routing-rules-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createRoutingRules = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({"success": false, "message": "user doesn't have the required role"});
                return true;
            }
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            const routingRulesEndpoint = process.env.ROUTING_RULES_SERVICE + "/organization/" + orgId + "/routingrules";
            //call the routing rule service
            await axios.post(routingRulesEndpoint, req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4094, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4095, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9042, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets a single routing using the routing-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.ROUTING_RULES_SERVICE + '/organization/' + orgId + '/routingrules/' + ruleId)
                .then((response) => {
                    res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4096, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4097, error.stack, [ruleId, orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9043, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * updating the existing rule using the routing-rules-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({"success": false, "message": "user doesn't have the required role"});
                return true;
            }
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            const routingRulesEndpoint = process.env.ROUTING_RULES_SERVICE + "/organization/" + orgId + "/routingrules/" + ruleId;
            //call the routing rule service
            await axios.patch(routingRulesEndpoint, req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4098, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4099, error.stack, [ruleId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9044, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateRoutingRulesOrdering = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({"success": false, "message": "user doesn't have the required role"});
                return true;
            }

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.patch(process.env.ROUTING_RULES_SERVICE + '/organization/' + orgId + '/routingrules', req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4100, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4101, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9045, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }


    /**
     * delete routing service based on route ID
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteRoutingRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({"success": false, "message": "user doesn't have the required role"});
                return true;
            }

            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            const routingRulesEndpoint = process.env.ROUTING_RULES_SERVICE + "/organization/" + orgId + "/routingrules/" + ruleId;
            //call the routing rule service
            const options = {
                data: req.body
            };
            await axios.delete(routingRulesEndpoint, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4102, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4103, error.stack, [ruleId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9046, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }


    /**
     * Gets the All getAuditHistory rules for the user's organization using the routing-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getRoutingRuleHistory = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.ROUTING_RULES_SERVICE + '/organization/' + orgId + '/routingrules/history')
                .then((response) => {
                    res.status(response.status).send(response.data);
                    }, (error) => {
                        if (error.response && error.response.data) {
                            ErrorService.reportError(orgId, null, 4104, error.stack, [orgId, JSON.stringify(error.response.data)]);
                            res.status(error.response.status).send(error.response.data);
                        } else {
                            let msg = ErrorService.reportError(orgId, null, 4105, error.stack, [orgId, error.message])
                            res.status(500).send({ "success": false, "message": msg });
                        }
                    }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9047, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }
}
