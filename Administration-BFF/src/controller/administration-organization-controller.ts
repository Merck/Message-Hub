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
import { ErrorService } from "../services/error-service";


let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationOrganizationController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {
        /**
         * @swagger
         *
         *  definitions:
         *    UserOrganization:
         *      type: object
         *      properties:
         *        username:
         *          type: string
         *          description: "The signed-in user's username"
         *          example: "john.smith@example.com"
         *        organization_id:
         *          type: number
         *          description: "The organization's unique id"
         *          example:  1
         *        subject_id:
         *          type: string
         *          description: "The signed-in user's subject ID from their App ID account"
         *          example: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
         *        organization_name:
         *          type: string
         *          description: "The organization's name"
         *          example: "Merck - North America"
         *    Organization:
         *      type: object
         *      properties:
         *        id:
         *          type: number
         *          description: "The organization's unique id"
         *          example:  1
         *        name:
         *          type: string
         *          description: "The organization's name"
         *          example: "Merck - North America"
         */

        /**
         * @swagger
         *
         * /admin/organization/:
         *    get:
         *      tags: ["Organizations API"]
         *      summary: "Gets the current user's organization profile"
         *      description: ""
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/UserOrganization'
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
         *    patch:
         *      tags: ["Organizations API"]
         *      summary: "Updates the current user's organization profile"
         *      description: "User must have organization_admin role to perform this function"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              required: [name]
         *              properties:
         *                name:
         *                  type: string
         *                  description: "The new organization name"
         *                  example: "Test Organization 1234"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/Organization'
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
        this.router.get("/organization", this.getOrganization);
        this.router.patch("/organization", this.updateOrganization);
    }


    /**
     * Gets the user's organization from the organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            await AdministrationOrganizationController.getOrganizationForCaller(req, res)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(null, null, 4029, error.stack, [JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(null, null, 4030, error.stack, [ error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9014, e.stack, [e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Updates the organization name by calling the organization service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateOrganization = async (req: express.Request, res: express.Response): Promise<boolean> => {
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

            //call the organization service
            await axios.patch(process.env.ORGANIZATION_SERVICE + '/organizations/' + orgId, req.body)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        ErrorService.reportError(orgId, null, 4031, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send(error.response.data);
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4032, error.stack, [ orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9015, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }

    /**
     * Gets the user's organization based on their subject id from the organization-service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    public static getOrganizationForCaller = async (req: express.Request, res: express.Response) => {

        let subjectId;
        try {
            subjectId = AdministrationController.getSubjectId(req);
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 4033, e.stack,  [e.message])
            res.status(401).send({ "success": false, "message": msg });
            throw e;
        }

        const options = {
            params: {
                subjectid: subjectId
            }
        };

        //get the organization for this subject
        return axios.get(process.env.ORGANIZATION_SERVICE + '/organizations', options);
    }

    /**
     * Gets the organization id for the caller
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    public static getOrganizationId = async (req: express.Request, res: express.Response): Promise<string> => {
        let orgId: string = '';
        try {
            await AdministrationOrganizationController.getOrganizationForCaller(req, res).then((response) => {
                orgId = response.data.organization_id;
            }, (error) => {
                if (error.response && error.response.data) {
                    ErrorService.reportError(null, null, 4034, error.stack, [JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send(error.response.data);
                } else {
                    let msg = ErrorService.reportError(null, null, 4035, error.stack, [error.message])
                    res.status(500).send({ "success": false, "message": msg });
                }
            });
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9016, e.stack, [e.message])
            res.status(500).send({ "success": false, "message": msg });
        }
        return orgId;
    }
}