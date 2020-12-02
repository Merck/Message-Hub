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

import express, { query } from "express";
import path from "path";
import axios from "axios";
import { CommonUtils } from "../utils/common-utils";
import { ErrorService } from "../services/error-service";

import { AdministrationOrganizationController } from "./administration-organization-controller";
import { AdministrationController } from "./administration-controller";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationAlertsController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {

        /**
         * @swagger
         *
         * definitions:
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
         *
         *  /admin/alerts:
         *    get:
         *      tags: ["Alert API"]
         *      summary: "Gets all the alerts for the user's organization"
         *      parameters:
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
        this.router.get("/alerts", this.getAlertsForOrganization);

        /**
         * @swagger
         *
         *  /admin/alerts/{alertId}:
         *    get:
         *      tags: ["Alert API"]
         *      summary: "Gets the alert for the user's organization"
         *      parameters:
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
        this.router.get("/alerts/:alertId", this.getAlert);

        /**
         * @swagger
         *
         *  /admin/alertscount:
         *    get:
         *      tags: ["Alert API"]
         *      summary: "Gets the error and warning alerts count for the user's organization"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/AlertsCount'
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
        this.router.get("/alertscount", this.getAlertsCountForOrganization);

        /**
         * @swagger
         *
         *  /admin/alerts:
         *    delete:
         *      tags: ["Alert API"]
         *      summary: "Clears all the alerts for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
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
        this.router.delete("/alerts", this.deleteAllAlerts);

        /**
         * @swagger
         *
         *  /admin/alerts/{alertId}:
         *    delete:
         *      tags: ["Alert API"]
         *      summary: "Clears a particular alert by its ID for the user's organization"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: alertId
         *          in: path
         *          description: "The alerts's unique id in the hub's database."
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
        this.router.delete("/alerts/:alertId", this.deleteAlert);
    }


    /**
     * Get the alerts for the organization using the alert-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAlertsForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            orgId = await AdministrationOrganizationController.getOrganizationId(req, res);
            if (orgId === '') {
                return false;
            }
            let pagenumber = 1;
            let resultsperpage = 10;
            if (req.query.pagenumber && req.query.pagenumber !== undefined) {
                pagenumber = parseInt((req.query as any).pagenumber);
            }
            if (req.query.resultsperpage && req.query.resultsperpage !== undefined) {
                resultsperpage = parseInt((req.query as any).resultsperpage);
            }

            //call the alert service
            await axios.get(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alerts?pagenumber=' + pagenumber + '&resultsperpage=' + resultsperpage)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4001, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4002, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9000, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Get the alert for the organization using the alert-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAlert = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            orgId = await AdministrationOrganizationController.getOrganizationId(req, res);
            if (orgId === '') {
                return false;
            }
            //call the alert service
            await axios.get(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alerts/' + req.params.alertId)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4003, error.stack, [req.params.alertId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4004, error.stack, [req.params.alertId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9001, e.stack, [req.params.alertId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Get the count of Error and Warning alerts for the organization using the alert-service and organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAlertsCountForOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            orgId = await AdministrationOrganizationController.getOrganizationId(req, res);
            if (orgId === '') {
                return false;
            }
            //call the alert service
            await axios.get(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alertscount')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4005, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4006, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9002, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Deletes all alerts for the organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteAllAlerts = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({ "success": false, "message": "user doesn't have the required role" });
                return true;
            }
            orgId = await AdministrationOrganizationController.getOrganizationId(req, res);
            if (orgId === '') {
                return false;
            }
            //call the alert service
            await axios.delete(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alerts')
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4007, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4008, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9003, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Deletes a specific alert
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteAlert = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //user must have the organization_admin role to call this api
            let hasPermission = AdministrationController.subjectHasRole(req, "organization_admin");
            if (!hasPermission) {
                res.status(401).send({ "success": false, "message": "user doesn't have the required role" });
                return true;
            }
            orgId = await AdministrationOrganizationController.getOrganizationId(req, res);
            if (orgId === '') {
                return false;
            }
            //call the alert service
            await axios.delete(process.env.ALERT_SERVICE + '/organization/' + orgId + '/alerts/' + req.params.alertId)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4009, error.stack, [req.params.alertId, orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4010, error.stack, [req.params.alertId, orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9004, e.stack, [req.params.alertId, orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }
}