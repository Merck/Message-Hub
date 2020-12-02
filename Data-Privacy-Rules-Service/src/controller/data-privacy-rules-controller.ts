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
 * EPCIS MESSAGING HUB - DATA PRIVACY RULES SERVICE

 */

import express from "express";
import path from "path";
import { CommonUtils } from "../utils/common-utils";
import { PostgresService } from "../services/postgres-service"
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

export class DataPrivacyRulesController {

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
         *  404Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "no rule found"
         *  500Response:
         *    type: object
         *    properties:
         *      success:
         *        type: boolean
         *        example: false
         *      message:
         *        type: string
         *        example: "An error has occurred..."
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
         *  /organization/{orgId}/dataprivacyrules:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets all of the data privacy rules for the user's organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The user's organization id (determined by the BFF from the user's access token subject_id)"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayPrivacyRuleResponse'
         *        404:
         *          description: "No Rule found"
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
        this.router.get("/organization/:orgId/dataprivacyrules", this.getAllDataPrivacyRulesForOrganization);

        /**
         * @swagger
         *
         *  /organization/{orgId}/dataprivacyrules/history:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets the data privacy rules history (audit log) for the user's organization"
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
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/ArrayPrivacyRuleHistoryResponse'
         *        404:
         *          description: "No Rule history found"
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
        this.router.get("/organization/:orgId/dataprivacyrules/history", this.getDataPrivacyRulesHistory)

        /**
         * @swagger
         *
         *  /organization/{orgId}/dataprivacyrules:
         *    post:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Creates a new data privacy rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
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
        this.router.post("/organization/:orgId/dataprivacyrules", this.createDataPrivacyRule);

        /**
         * @swagger
         *
         *  /organization/{orgId}/dataprivacyrules/{ruleId}:
         *    get:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Gets a data privacy rule by id for the user's organization"
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
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/AllPrivacyRuleResponse'
         *        404:
         *          description: "No Rule found"
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
        this.router.get("/organization/:orgId/dataprivacyrules/:ruleId", this.getDataPrivacyRule);

        /**
         * @swagger
         *
         *  /organization/{orgId}/dataprivacyrules/{ruleId}:
         *    patch:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Updates a data privacy rule by id for the user's organization"
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
        this.router.patch("/organization/:orgId/dataprivacyrules/:ruleId", this.updateDataPrivacyRule);

        /**
         * @swagger
         *  /organization/{orgId}/dataprivacyrules:
         *    patch:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Reorders the data privacy rules for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
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
        this.router.patch("/organization/:orgId/dataprivacyrules", this.updateDataPrivacyRulesOrdering);

        /**
         * @swagger
         *
         *  /organization/{orgId}/dataprivacyrules/{ruleId}:
         *    delete:
         *      tags: ["Data Privacy Rules API"]
         *      summary: "Deletes a data privacy rule by id for the user's organization"
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
        this.router.delete("/organization/:orgId/dataprivacyrules/:ruleId", this.deleteDataPrivacyRule);

        /**
         * @swagger
         *
         *  /dataprivacyrules/config/datafields:
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
         *        404:
         *          description: "No Rule found"
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
        this.router.get('/dataprivacyrules/config/datafields', this.getDataFields);
    }

    /**
     * Get all data privacy rules for an organization
     *
     * @param req
     * @param res
     */
    getAllDataPrivacyRulesForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            await this._postgresService.getAllDataPrivacyRulesForOrganization(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(200).send([]);
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4001, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9001, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the Data Privacy Rules History
     *
     * @param req
     * @param res
     */
    getDataPrivacyRulesHistory = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            await this._postgresService.getDataPrivacyRulesHistory(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({ "success": false, "message": "no audit history found" });
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4002, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9002, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Creates a new Data Privacy rule
     *
     * @param req
     * @param res
     */
    createDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);

        const reqBody = req.body;
        let dataField = reqBody.data_field;
        if (!dataField) {
            res.status(400).send({ "success": false, "message": "Missing data_field in request" });
            return false;
        }

        // check if the can_store is present or not since its a boolean variable
        if (!reqBody.hasOwnProperty('can_store')) {
            res.status(400).send({ "success": false, "message": "Missing can_store in request" });
            return false;
        }
        let canStore = reqBody.can_store;

        let order = reqBody.order;
        if (!order) {
            res.status(400).send({ "success": false, "message": "Missing order in request" });
            return false;
        }

        let editor = reqBody.editor;
        if (!editor) {
            res.status(400).send({ "success": false, "message": "Missing editor in request" });
            return false;
        }

        try {
            //save to database
            await this._postgresService.createDataPrivacyRule(orgId, dataField, canStore, order, editor)
                .then(result => {
                    res.status(200).send(result.rows[0])
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4003, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9003, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Gets a particular dataprivacy rule based on its ID
     *
     * @param req
     * @param res
     */
    getDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);

        try {
            await this._postgresService.getDataPrivacyRule(orgId, ruleId)
                .then(result => {
                    if (result.rows.length > 0) {
                        res.status(200).send(result.rows[0]);
                    } else {
                        res.status(404).send({ "success": false, "message": "no rule found with that id" });
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4008, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9000, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
        return true;
    }

    /**
     * Updates a rule in the database
     *
     * @param req
     * @param res
     */
    updateDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);
        let dataField, canStore = undefined;
        const reqBody = req.body;
        // check if the can_store is present or not since its a boolean variable
        if (!reqBody.data_field) {
            res.status(400).send({ "success": false, "message": "Missing data_field in request" });
            return false;
        }
        if (!reqBody.hasOwnProperty('can_store')) {
            res.status(400).send({ "success": false, "message": "Missing can_store in request" });
            return false;
        }
        if (!reqBody.editor) {
            res.status(400).send({ "success": false, "message": "Missing editor in request" });
            return false;
        }

        if (reqBody.data_field)
            dataField = reqBody.data_field;
        if (reqBody.hasOwnProperty('can_store'))
            canStore = reqBody.can_store;
        let editor = reqBody.editor;

        try {
            //update the database
            await this._postgresService.updateDataPrivacyRule(orgId, ruleId, dataField, canStore, editor)
                .then(result => {
                    res.status(200).send(result.rows[0])
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
     * Updates the ordering of a list of dataprivacy rules
     *
     * @param req
     * @param res
     */
    updateDataPrivacyRulesOrdering = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);

        let ruleList = req.body.rulesordered;
        if (!ruleList || !Array.isArray(ruleList)) {
            res.status(400).send({ "success": false, "message": "Missing rulesordered in request or is not an array" });
            return false;
        }

        if (Array.isArray(ruleList) && ruleList.length === 0) {
            res.status(400).send({ "success": false, "message": "rulesordered field is empty." });
            return false;
        }

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({ "success": false, "message": "Missing editor in request" });
            return false;
        }

        try {
            //update the database
            await this._postgresService.updateDataPrivacyRulesOrdering(orgId, ruleList, editor);
            res.status(200).send({ "success": true, "message": "rules reordered" });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 4005, e.stack, null);
            res.status(500).send({ "success": false, "message": msg});
        }
        return true;
    }

    /**
     * Deletes a dataprivacy rule (changes the status to DELETED)
     *
     * @param req
     * @param res
     */
    deleteDataPrivacyRule = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let ruleId = parseInt(req.params.ruleId);

        let editor = req.body.editor;
        if (!editor) {
            res.status(400).send({ "success": false, "message": "Missing editor in request" });
            return false;
        }

        try {
            //delete from the database
            await this._postgresService.deleteDataPrivacyRule(orgId, ruleId, editor)
                .then(result => {
                    res.status(200).send({ "success": true, "message": "rule deleted" });
                }).catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4006, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9005, e.stack, null);
            res.status(400).send({ "success": false, "message": msg });
        }
        return true;
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
                        res.status(404).send({ "success": false, "message": "no data privacy rules data fields found" });
                    } else {
                        res.status(200).send(result.rows);
                    }
                }).catch(e => {
                    let msg = ErrorService.reportError(null, null, 4007, e.stack, null);
                    res.status(500).send({ "success": false, "message": msg });
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9006, e.stack, null);
            res.status(500).send({ "success": false, "message": msg });
        }
        return true;
    }
}