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
 * EPCIS MESSAGING HUB - ALERT SERVICE

 */

import express from "express";
import path from "path";
import {CommonUtils} from "../utils/common-utils";
import {PostgresService} from "../services/postgres-service"
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Alerts microservice.
 */
export class AlertController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();

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
         *  Alerts:
         *    type: object
         *    properties:
         *      id:
         *        type: number
         *        description: "The unique identifier for the Alerts as assigned by the Messaging Hub"
         *        example: 3
         *      timestamp:
         *        type: string
         *        description: "The alerts timestamp obtained from the submitted alert (not the system time)"
         *        example: "2014-04-01 15:19:49.31146+05:30"
         *      organization_id:
         *        type: number
         *        description: "The organization id"
         *        example: 1
         *      severity:
         *        type: string
         *        example: "ERROR"
         *      source:
         *        type: string
         *        description: "Source of service where alert is generated."
         *        example: "masterdata_service"
         *      errorCode:
         *        type: string
         *        description: "Error code of the alert."
         *        example: 'MSDS1001'
         *      errorEngDesc:
         *        type: string
         *        example: "XML doesn't comply with EPCIS standard."
         *      errorMsg:
         *        type: string
         *        example: "Error stack from the service."
         *  AlertsPagination:
         *    type: object
         *    properties:
         *      currentPage:
         *        type: number
         *        description: "The current page of alerts being shown."
         *        example: 3
         *      results:
         *        type: array
         *        items:
         *          $ref: '#/definitions/Alerts'
         *        description: "All alerts from the DB for the organization"
         *      resultsPerPage:
         *        type: number
         *        description: "The number of results per page."
         *        example: 10
         *      totalPages:
         *        type: number
         *        description: "The total pages of the alerts to be displayed."
         *        example: 3
         *      totalResults:
         *        type: number
         *        description: "Total results of alerts in db."
         *        example: 28
         *  AlertsCount:
         *    type: object
         *    properties:
         *      errorsCount:
         *        type: number
         *        description: "The count of Error alerts."
         *        example: 38
         *      warningsCount:
         *        type: number
         *        description: "The count of Error alerts."
         *        example: 89
         */

        /**
         * @swagger
         *  '/organization/{orgId}/alerts':
         *    post:
         *      tags: ["Alerts API"]
         *      summary: "Adds a alert to the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                severity:
         *                  type: string
         *                  description: "the severity of error alerted"
         *                  required: true
         *                  example: "WARNING"
         *                source:
         *                  type: string
         *                  description: "The source of the alert"
         *                  required: true
         *                  example: "event-service"
         *                errorCode:
         *                  type: string
         *                  description: "Error code of the alert"
         *                  required: true
         *                  example: "EVTS4001"
         *                errorEngDesc:
         *                  type: string
         *                  description: "The description of the alert"
         *                  required: true
         *                  example: "XML doesn't comply with EPCIS standard."
         *                errorMsg:
         *                  type: string
         *                  description: "The detailed error stack from the system regarding the error"
         *                  example: "Error at line 20 with EPCISody which doesn't comply with EPCIS Masterdata standard."
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Alerts'
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
        this.router.post("/organization/:orgId/alerts", this.createAlert);

        /**
         * @swagger
         *  '/organization/{orgId}/alerts':
         *    get:
         *      tags: ["Alerts API"]
         *      summary: "Gets all the alerts from the db."
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *        - name: pagenumber
         *          in: query
         *          description: "The page number of alerts to be displayed"
         *          schema:
         *            type: number
         *        - name: resultsperpage
         *          in: query
         *          description: "The total alerts per page to be displayed"
         *          schema:
         *            type: number
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/AlertsPagination'
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
        this.router.get("/organization/:orgId/alerts", this.getAllAlertsForOrganization);

        /**
         * @swagger
         *  '/organization/{orgId}/alerts/{alertId}':
         *    get:
         *      tags: ["Alerts API"]
         *      summary: "Gets a alert from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *        - name: alertId
         *          in: path
         *          description: "The alert id."
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Alerts'
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
        this.router.get("/organization/:orgId/alerts/:alertId", this.getAlert);

        /**
         * @swagger
         *  '/organization/{orgId}/alerts/alertscount':
         *    get:
         *      tags: ["Alerts API"]
         *      summary: "Gets the count of alerts from the db"
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
         *                  $ref: '#/definitions/AlertsCount'
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
        this.router.get("/organization/:orgId/alertscount", this.getAlertsCountByOrganization);

        /**
         * @swagger
         *  '/organization/{orgId}/alerts':
         *    delete:
         *      tags: ["Alerts API"]
         *      summary: "Clears all the alerts from the db"
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
         *                  $ref: '#/definitions/200Response'
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
        this.router.delete("/organization/:orgId/alerts", this.deleteAllAlertsForOrganization);

        /**
         * @swagger
         *  '/organization/{orgId}/alerts/{alertId}':
         *    delete:
         *      tags: ["Alerts API"]
         *      summary: "Clears a alert from the db"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id."
         *          required: true
         *          schema:
         *            type: string
         *        - name: alertId
         *          in: path
         *          description: "The alert id."
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
        this.router.delete("/organization/:orgId/alerts/:alertId", this.deleteAlert);
    }

    /**
     * Creates a new alert
     *
     * @param req
     * @param res
     */
    createAlert = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        if (!req.body.severity) {
            res.status(400).send({ "success": false, "message": "Missing severity in request" });
            return false;
        }
        if (!req.body.source) {
            res.status(400).send({ "success": false, "message": "Missing source in request" });
            return false;
        }
        if (!req.body.errorCode) {
            res.status(400).send({ "success": false, "message": "Missing errorCode in request" });
            return false;
        }
        if (!req.body.errorEngDesc) {
            res.status(400).send({ "success": false, "message": "Missing errorEngDesc in request" });
            return false;
        }
        let errorMsg, errorEngDesc;
        if (!req.body.errorMsg) {
            errorMsg = '';
        } else {
            errorMsg = req.body.errorMsg;
        }

        const severity = req.body.severity;
        const source = req.body.source;
        const errorCode = req.body.errorCode;
        errorEngDesc = req.body.errorEngDesc;
        if (errorEngDesc.length > 300)
            errorEngDesc = errorEngDesc.substring(0,299);

        console.log(errorEngDesc)
        try {
            const result = await this._postgresService.createAlert(orgId, severity, source, errorCode, errorEngDesc, errorMsg);
            res.status(200).send(result.rows[0]);
        } catch(err) {
            let msg = ErrorService.reportError(orgId, null, 4002, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }

    /**
     * Get all alerts for an organization
     *
     * @param req
     * @param res
     */
    getAllAlertsForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let pagenumber: number = 1;
        let resultsperpage: number = 10;

        if (req.query.pagenumber && req.query.pagenumber !== undefined) {
            pagenumber = parseInt((req.query as any).pagenumber);
        }
        if (req.query.resultsperpage && req.query.resultsperpage !== undefined) {
            resultsperpage = parseInt((req.query as any).resultsperpage);
        }
        if (pagenumber <= 0 && resultsperpage <= 0) {
            pagenumber = 1;
            resultsperpage = 10;
        }
        try {
            let response: any = {};
            const result = await this._postgresService.getAllAlertsForOrganization(orgId, pagenumber, resultsperpage);
            const resultCount = await this._postgresService.getCountOfAlerts(orgId);
            const totalCount = parseInt(resultCount.rows[0].count);
            response.currentPage = pagenumber;
            response.results = result.rows;
            response.resultsPerPage = resultsperpage;
            response.totalPages = Math.ceil(totalCount / resultsperpage);
            response.totalResults = totalCount;

            res.status(200).send(response);
        } catch(err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }

    /**
     * Gets an alert
     *
     * @param req
     * @param res
     */
    getAlert = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let alertId = req.params.alertId;
        try {
            const result = await this._postgresService.getAlert(orgId, alertId);
            res.status(200).send(result.rows[0]);
        } catch(err) {
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }

    /**
     * Gets error and warning alerts count for an organization
     *
     * @param req
     * @param res
     */
    getAlertsCountByOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            let response: any = {};
            const errorCountResult = await this._postgresService.getCountOfErrorAlerts(orgId);
            response.errorsCount = parseInt(errorCountResult.rows[0].count);
            const warningCountResult = await this._postgresService.getCountOfWarningAlerts(orgId);
            response.warningsCount = parseInt(warningCountResult.rows[0].count);
            res.status(200).send(response);
        } catch(err) {            
            let msg = ErrorService.reportError(orgId, null, 4001, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }

    /**
     * Delete all alerts for an organization
     *
     * @param req
     * @param res
     */
    deleteAllAlertsForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        try {
            const result = await this._postgresService.deleteAllAlertsForOrganization(orgId);
            if (result.rowCount == 0) {
                res.status(404).send({ success: false, message: "no alerts found" });
            } else {
                res.status(200).send({ success: true, message: "All alerts are cleared." });
            }
        } catch(err) {
            let msg = ErrorService.reportError(orgId, null, 4003, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }

    /**
     * Deletes an alert
     *
     * @param req
     * @param res
     */
    deleteAlert = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = parseInt(req.params.orgId);
        let alertId = req.params.alertId;
        try {
            const result = await this._postgresService.deleteAlert(orgId, alertId);
            if (result.rowCount == 0) {
                res.status(404).send({ success: false, message: "no alert found" });
            } else {
                res.status(200).send({ success: true, message: "Alert is cleared." });
            }
        } catch(err) {
            let msg = ErrorService.reportError(orgId, null, 4003, err.stack, null);
            res.status(500).send({success: false, message: msg});
        }
        return true;
    }
}