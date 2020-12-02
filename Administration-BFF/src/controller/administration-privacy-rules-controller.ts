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
import { CommonUtils } from "../utils/common-utils";
import axios from "axios";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));
import { AdministrationController } from "./administration-controller";
import { AdministrationOrganizationController } from "./administration-organization-controller";
import { ErrorService } from "../services/error-service";

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationPrivacyRulesController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         *
         * definitions:
         *  PrivacyRule:
         *    type: object
         *    properties:
         *      id:
         *        type: number
         *        description: "The unique identifier for the data privacy rule as assigned by the Messaging Hub"
         *        example: 5
         *      organization_id:
         *        type: number
         *        description: "The organization id that owns the client_id"
         *        example: 3
         *      data_field:
         *        type: number
         *        description: "The data field corresponds to the field to which privacy rule to be applied."
         *        example: 3
         *      can_store:
         *        type: boolean
         *        description: "can_store represents whether to store the data in db for the data_field value"
         *        example: 3
         *      order:
         *        type: number
         *        example: 2
         *      status:
         *        type: string
         *        example: "ACTIVE"
         *  AllPrivacyRuleResponse:
         *    type: object
         *    properties:
         *      id:
         *        type: number
         *        description: "The unique identifier for the data privacy rule as assigned by the Messaging Hub"
         *        example: 5
         *      organization_id:
         *        type: number
         *        description: "The organization id that owns the client_id"
         *        example: 3
         *      data_field:
         *        type: number
         *        description: "The data field corresponds to the field to which privacy rule to be applied."
         *        example: 3
         *      can_store:
         *        type: boolean
         *        description: "can_store represents whether to store the data in db for the data_field value"
         *        example: 3
         *      order:
         *        type: number
         *        example: 2
         *      datafield_type:
         *        type: string
         *        example: "masterdata"
         *      datafield_display:
         *        type: string
         *        example: "Read Point"
         *      datafield_path:
         *        type: string
         *        example: "urn:epcglobal:epcis:vtype:ReadPoint"
         *  ArrayPrivacyRuleResponse:
         *        type: array
         *        items:
         *          $ref: '#/definitions/AllPrivacyRuleResponse'
         *        description: "All Data Privacy rule for an organization"
         *  PrivacyRuleHistory:
         *    type: object
         *    properties:
         *      rules_id:
         *        type: number
         *        description: "The unique identifier for the data privacy rule as assigned by the Messaging Hub"
         *        example: 5
         *      change_description:
         *        type: string
         *        description: "The description of the changes done on the rule id"
         *        example: "CREATED"
         *      editor:
         *        type: string
         *        description: "The editor of the audit trail for rule id."
         *        example: 3
         *      timestamp:
         *        type: string
         *        description: "The privacy rule timestamp obtained while adding or updating the rule id"
         *        example: "2014-04-01 15:19:49.31146+05:30"
         *      datafield_type:
         *        type: string
         *        example: "masterdata"
         *      new_datafield_display:
         *        type: string
         *        example: "Read Point"
         *      new_order:
         *        type: number
         *        example: 3
         *      can_store:
         *        type: boolean
         *        example: true
         *  ArrayPrivacyRuleHistoryResponse:
         *        type: array
         *        items:
         *          $ref: '#/definitions/PrivacyRuleHistory'
         *        description: "Audit trail(history) of Data Privacy rules for an organization"
         *  PrivacyDataField:
         *    type: object
         *    properties:
         *      id:
         *        type: number
         *        description: "The unique identifier for the data privacy data field as assigned by the Messaging Hub"
         *        example: 3
         *      path:
         *        type: string
         *        description: "The path of the data field"
         *        example: "$somepath.someelement"
         *      xpath:
         *        type: string
         *        description: "The xpath of the data field"
         *        example: "//somepath.someelement"
         *      display_name:
         *        type: string
         *        description: "The name of the data field to be displayed."
         *        example: "Element"
         *      data_type:
         *        type: string
         *        description: "The data type for the data field defined"
         *        example: "aggregation"
         *  ArrayPrivacyDataField:
         *        type: array
         *        items:
         *          $ref: '#/definitions/PrivacyDataField'
         *        description: "List of data privacy rule data fields."
         *  RuleResponse:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: true
         *      message:
         *        type: string
         *        example: "rules updated message"
         */


        /**
         * @swagger
         *
         *  /admin/dataprivacyrules:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets all of the data privacy rules for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayPrivacyRuleResponse'
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
        this.router.get("/dataprivacyrules", this.getDataPrivacyRules);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules/history:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets the data privacy rules history (audit log) for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayPrivacyRuleHistoryResponse'
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
        this.router.get("/dataprivacyrules/history", this.getDataPrivacyRuleHistory);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules/config/datafields:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets the configured data privacy rules data fields"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayPrivacyDataField'
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
        this.router.get("/dataprivacyrules/config/datafields", this.getDataPrivacyRuleDataFieldsConfig);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules:
         *    post:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Creates a new data privacy rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                data_field:
         *                  type: number
         *                  description: "The data field of the privacy rule"
         *                  example: 5
         *                can_store:
         *                  type: boolean
         *                  description: "Whether to store the data for data field mentioned on to DB."
         *                  example: true
         *                order:
         *                  type: number
         *                  description: "Order on to which data field to be added."
         *                  example: 1
         *                editor:
         *                  type: string
         *                  description: "Identity who is creating the data privacy rule"
         *                  example: "example@company.com"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/PrivacyRule'
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
        this.router.post("/dataprivacyrules", this.createDataPrivacyRules);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules/{ruleId}:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets a data privacy rule by id for the user's organization"
         *      parameters:
         *        - name: ruleId
         *          in: path
         *          description: "The rule's unique id in the hub's database."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/AllPrivacyRuleResponse'
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
        this.router.get("/dataprivacyrules/:ruleId", this.getDataPrivacyRule);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules/{ruleId}:
         *    patch:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Updates a data privacy rule by id for the user's organization"
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
         *                  description: "The data field of the privacy rule"
         *                  example: 5
         *                can_store:
         *                  type: boolean
         *                  description: "Whether to store the data for data field mentioned on to DB."
         *                  example: true
         *                editor:
         *                  type: string
         *                  description: "Identity who is updating the data privacy rule"
         *                  example: "example@company.com"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/PrivacyRule'
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
        this.router.patch("/dataprivacyrules/:ruleId", this.updateDataPrivacyRule);

        /**
         * @swagger
         *
         *  /admin/dataprivacyrules/{ruleId}:
         *    delete:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Deletes a data privacy rule by id for the user's organization"
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
         *                editor:
         *                  type: string
         *                  description: "Identity who is deleting the data privacy rule"
         *                  example: "example@company.com"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/RuleResponse'
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
        this.router.delete("/dataprivacyrules/:ruleId", this.deleteDataPrivacyRule);

        /**
         * @swagger
         *  /admin/dataprivacyrules:
         *    patch:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Reorders the data privacy rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                rulesordered:
         *                  type: Array
         *                  description: "The array of rule id's to be reordered"
         *                  example: [5, 2, 9, 7, 4]
         *                editor:
         *                  type: string
         *                  description: "Identity who is reordering the data privacy rule"
         *                  example: "example@company.com"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/RuleResponse'
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
        this.router.patch("/dataprivacyrules", this.updateDataPrivacyRulesOrdering);
    }

    /**
     * Gets a list of configured Data Fields for use in data privacy rules
     *
     * @param req - incoming request
     * @param res - outgoing response
     */
    getDataPrivacyRuleDataFieldsConfig = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.DATA_PRIVACY_RULES_SERVICE + '/dataprivacyrules/config/datafields')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4070, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4071, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9030, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets All Data privacy rules for the user's organization using the data-privacy-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDataPrivacyRules = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/' + orgId + '/dataprivacyrules')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4072, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4073, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9031, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * creates new data privacy rule using the data-privacy-rules-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createDataPrivacyRules = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
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

            const dataprivacyrulesEndpoint = process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/" + orgId + "/dataprivacyrules";
            //call the routing rule service
            await axios.post(dataprivacyrulesEndpoint, req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4074, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4075, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9032, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets a data privacy rule for rule id using the data-privacy-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                orgId = id
            });
            if (orgId === '') {
                return false;
            }

            await axios.get(process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/' + orgId + '/dataprivacyrules/' + ruleId)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4076, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4077, error.stack, [ruleId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9033, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * update the existing rule using the data-privacy-rules-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
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

            const dataprivacyrulesEndpoint = process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/" + orgId + "/dataprivacyrules/" + ruleId;
            //call the data privacy rule service
            await axios.patch(dataprivacyrulesEndpoint, req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4078, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4079, error.stack, [ruleId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9034, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * reorder the existing rule using the data-privacy-rules-service
     * 
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateDataPrivacyRulesOrdering = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
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

            await axios.patch(process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/' + orgId + '/dataprivacyrules', req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4080, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4081, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9035, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }


    /**
     * delete data privacy rule id by calling data privacy service.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        let ruleId = parseInt(req.params.ruleId);
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
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

            const dataprivacyrulesEndpoint = process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/" + orgId + "/dataprivacyrules/" + ruleId;
            //call the routing rule service
            const options = {
                data: req.body
            };
            await axios.delete(dataprivacyrulesEndpoint, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4082, error.stack, [ruleId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4083, error.stack, [ruleId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9036, e.stack, [ruleId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }


    /**
     * Gets the history of data privacy audit rules for the user's organization using the data-privacy-rules-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getDataPrivacyRuleHistory = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
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

            await axios.get(process.env.DATA_PRIVACY_RULES_SERVICE + '/organization/' + orgId + '/dataprivacyrules/history')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4084, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4085, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9037, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }
}