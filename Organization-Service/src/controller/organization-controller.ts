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
 * EPCIS MESSAGING HUB - ORGANIZATION SERVICE

 */

import express from "express";
import path from "path";
import {CommonUtils} from "../utils/common-utils";
import {PostgresService} from "../services/postgres-service"
import {ErrorService} from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Organization microservice.
 */
export class OrganizationController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {

        /**
         * @swagger
         *
         *  definitions:
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
         *   404Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "Requested item not found"
         *   500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
         *   UserOrganization:
         *     type: object
         *     properties:
         *       username:
         *         type: string
         *         description: "The signed-in user's username"
         *         example: "john.smith@example.com"
         *       organization_id:
         *         type: number
         *         description: "The organization's unique id"
         *         example:  1
         *       subject_id:
         *         type: string
         *         description: "The signed-in user's subject ID from their App ID account"
         *         example: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
         *       organization_name:
         *         type: string
         *         description: "The organization's name"
         *         example: "Merck - North America"
         *   Organization:
         *     type: object
         *     properties:
         *       id:
         *         type: number
         *         description: "The organization's unique id"
         *         example:  1
         *       name:
         *         type: string
         *         description: "The organization's name"
         *         example: "Merck - North America"
         *   OrgUserSummary:
         *     type: object
         *     properties:
         *       username:
         *         type: string
         *         example:  "john.smith@example.com"
         *       organization_id:
         *         type: number
         *         example: 1
         *       subject_id:
         *         type: string
         *         example: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
         *   OrgUserList:
         *     type: array
         *     items:
         *       $ref: '#/definitions/OrgUserSummary'
         *   Role:
         *     type: object
         *     properties:
         *       id:
         *         type: string
         *         description: "The role ID from App ID"
         *         example: "0aead49b-036a-42b7-ad91-778762be1f7c"
         *       name:
         *         type: string
         *         description: "The role name from App ID"
         *         example: "organization_user"
         *   OrgUser:
         *     type: object
         *     properties:
         *       userId:
         *         type: string
         *         description: "The user's unique Cloud Directory id"
         *         example: "0d81b7d5-97da-477e-88cb-71f61ef8a21a"
         *       subjectId:
         *         type: string
         *         description: "Always an empty string"
         *         example: ""
         *       username:
         *         type: string
         *         description: "The user's login username"
         *         example: "john.smith@example.com"
         *       givenName:
         *         type: string
         *         description: "The user's first (given) name"
         *         example: "John"
         *       familyName:
         *         type: string
         *         description: "The user's last (family) name"
         *         example: "Smith"
         *       displayName:
         *         type: string
         *         description: "The user's full name"
         *         example: "John Smith"
         *       roles:
         *         type: array
         *         items:
         *           $ref: '#/definitions/Role'
         */


        /**
         * @swagger
         *
         * /organizations:
         *    get:
         *      tags: ["Organizations API"]
         *      summary: "Gets the current user's organization profile based on either their username, subject id or client id"
         *      parameters:
         *        - name: username
         *          in: path
         *          description: "The user's username"
         *          required: false
         *          schema:
         *            type: string
         *        - name: subjectid
         *          in: path
         *          description: "The user's subject id obtained from their access token"
         *          required: false
         *          schema:
         *            type: string
         *        - name: clientid
         *          in: path
         *          description: "The caller's client id obtained from their access token"
         *          required: false
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/UserOrganization'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         */
        this.router.get("/organizations", this.findOrganization);

        /**
         * @swagger
         *
         * /organizations:
         *    post:
         *      tags: ["Organizations API"]
         *      summary: "Creates a new organization"
         *      description: "This API is not currently exposed through any BFF"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                name:
         *                  type: string
         *                  description: "The name for the organization"
         *                  example: "My New Organization"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/Organization'
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
        this.router.post("/organizations", this.createOrganization);

        /**
         * @swagger
         *
         * /organizations/{orgId}:
         *    get:
         *      tags: ["Organizations API"]
         *      summary: "Gets an organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/Organization'
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
        this.router.get("/organizations/:orgId", this.getOrganization);

        /**
         * @swagger
         *
         * /organizations/{orgId}:
         *    patch:
         *      tags: ["Organizations API"]
         *      summary: "Updates an organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization id"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                name:
         *                  type: string
         *                  description: "The name for the organization"
         *                  example: "My New Organization"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/Organization'
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
        this.router.patch("/organizations/:orgId", this.updateOrganization);

        /**
         * @swagger
         *
         * /organizations/{orgId}:
         *    delete:
         *      tags: ["Organizations API"]
         *      summary: "Deletes a new organization"
         *      description: "This API is not currently exposed through any BFF"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/Organization'
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
        this.router.delete("/organizations/:orgId", this.deleteOrganization);


        /**
         *  @swagger
         *
         *  /organizations/{orgId}/users:
         *    get:
         *      tags: ["Organization Users API"]
         *      summary: "Gets a list organization users"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUserList'
         *        404:
         *          description: "Not Authorized"
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
         *    post:
         *      tags: ["Organization Users API"]
         *      summary: "Associates a user with an organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                username:
         *                  type: string
         *                  description: "The user's username"
         *                  example: "someone@hub.com"
         *                subjectid:
         *                  type: string
         *                  description: "The user's subject id from App ID"
         *                  example: "0d81b7d5-97da-477e-88cb-71f61ef8a21a"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/OrgUser'
         *        400:
         *          description: "Not Found"
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
        this.router.get("/organizations/:orgId/users", this.getOrganizationUsers);
        this.router.post("/organizations/:orgId/users", this.createOrganizationUser);

        /**
         * @swagger
         *
         *  /organizations/{orgId}/users/{subjectId}:
         *    get:
         *      tags: ["Organization Users API"]
         *      summary: "Gets an organization user by their subject id"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: subjectId
         *          in: path
         *          description: "The user's subject id"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUser'
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
         *    patch:
         *      tags: ["Organization Users API"]
         *      summary: "Updates an organization user"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: subjectId
         *          in: path
         *          description: "The user's subject id"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                newusername:
         *                  type: string
         *                  description: "The new user's new login username (must be unique)"
         *                  example: "john.smith@example.com"
         *                newfirstname:
         *                  type: string
         *                  description: "The new user's new first (given) name"
         *                  example: "John"
         *                newlastname:
         *                  type: string
         *                  description: "The new user's new last (family) name"
         *                  example: "Smith"
         *                isadmin:
         *                  type: boolean
         *                  description: "Is this user to be assigned Organization Admin role"
         *                  example: false
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUser'
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
         *    delete:
         *      tags: ["Organization Users API"]
         *      summary: "Deletes an organization user"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: subjectId
         *          in: path
         *          description: "The user's subject id"
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
         *
         */
        this.router.get("/organizations/:orgId/users/:subjectId", this.getOrganizationUser);
        this.router.patch("/organizations/:orgId/users/:subjectId", this.updateOrganizationUser);
        this.router.delete("/organizations/:orgId/users/:subjectId", this.deleteOrganizationUser);


        /**
         *  @swagger
         *
         *  /organizations/{orgId}/clients:
         *    get:
         *      tags: ["Organization Clients API"]
         *      summary: "Gets a list organization client ids"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUserList'
         *        404:
         *          description: "Not Authorized"
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
         *    post:
         *      tags: ["Organization Clients API"]
         *      summary: "Associates a client credential with an organization"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                sourcename:
         *                  type: string
         *                  description: "The caller's system or source name"
         *                  example: "ATTP"
         *                clientid:
         *                  type: string
         *                  description: "The caller's client id from App ID"
         *                  example: "0d81b7d5-97da-477e-88cb-71f61ef8a21a"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/OrgUser'
         *        400:
         *          description: "Not Found"
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
        this.router.get("/organizations/:orgId/clients", this.getOrganizationClients);
        this.router.post("/organizations/:orgId/clients", this.createOrganizationClient);


        /**
         * @swagger
         *
         *  /organizations/{orgId}/clients/{clientId}:
         *    get:
         *      tags: ["Organization Clients API"]
         *      summary: "Gets an organization client by their client id"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: clientId
         *          in: path
         *          description: "The caller's client ID"
         *          required: true
         *          schema:
         *            type: string
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUser'
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
         *    patch:
         *      tags: ["Organization Clients API"]
         *      summary: "Updates an organization client"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: clientId
         *          in: path
         *          description: "The caller's client id"
         *          required: true
         *          schema:
         *            type: string
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                newsourcename:
         *                  type: string
         *                  description: "The new caller's new source name"
         *                  example: "ATTP"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUser'
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
         *    delete:
         *      tags: ["Organization Clients API"]
         *      summary: "Deletes an organization client"
         *      parameters:
         *        - name: orgId
         *          in: path
         *          description: "The organization ID"
         *          required: true
         *          schema:
         *            type: string
         *        - name: clientId
         *          in: path
         *          description: "The caller's client id"
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
         *
         */
        this.router.get("/organizations/:orgId/clients/:clientId", this.getOrganizationClient);
        this.router.patch("/organizations/:orgId/clients/:clientId", this.updateOrganizationClient);
        this.router.delete("/organizations/:orgId/clients/:clientId", this.deleteOrganizationClient);
    }

    /**
     * Finds an organization for a username, subject id, or client id
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    findOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        try {
            var username: string | undefined;
            if (req.query.username) {
                if (Array.isArray(req.query.username)) {
                    username = (req.query as any).username[0];
                } else {
                    username = (req.query as any).username;
                }
            }

            var subjectId: string | undefined;
            if (req.query.subjectid) {
                if (Array.isArray(req.query.subjectid)) {
                    subjectId = (req.query as any).subjectid[0];
                } else {
                    subjectId = (req.query as any).subjectid;
                }
            }

            var clientId: string | undefined;
            if (req.query.clientid) {
                if (Array.isArray(req.query.clientid)) {
                    clientId = (req.query as any).clientid[0];
                } else {
                    clientId = (req.query as any).clientid;
                }
            }

            if (username) {
                await this._postgresService.getOrganizationForUser(username)
                    .then(result => {
                        if (result.rowCount == 0) {
                            res.status(404).send({success: false, message: "no organization found for username"});
                        } else {
                            res.status(200).send(result.rows[0]);
                        }
                    })
                    .catch(e => {
                        let msg = ErrorService.reportError(null, null, 4000, e.stack, username)
                        res.status(500).send({success: false, message: msg});
                    });
            } else if (subjectId) {
                await this._postgresService.getOrganizationForUserSubjectId(subjectId)
                    .then(result => {
                        if (result.rowCount == 0) {
                            res.status(404).send({
                                success: false,
                                message: "no organization found for subject id"
                            });
                        } else {
                            res.status(200).send(result.rows[0]);
                        }
                    })
                    .catch(e => {
                        let msg = ErrorService.reportError(null, null, 4001, e.stack, subjectId)
                        res.status(500).send({success: false, message: msg});
                    });
            } else if (clientId) {
                await this._postgresService.getOrganizationForClient(clientId)
                    .then(result => {
                        if (result.rowCount == 0) {
                            res.status(404).send({success: false, message: "no organization found for client id"});
                        } else {
                            res.status(200).send(result.rows[0]);
                        }
                    })
                    .catch(e => {
                        let msg = ErrorService.reportError(null, clientId, 4002, e.stack, clientId)
                        res.status(500).send({success: false, message: msg});
                    });
            } else {
                res.status(400).send({
                    success: false,
                    message: "either username, subjectid or clientid parameter is required"
                });
            }
        } catch (error) {
            let msg = ErrorService.reportError(null, null, 9000, error.stack, null)
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Gets an organization for a org id
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganization = async (req: express.Request, res: express.Response): Promise<void> => {

        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            await this._postgresService.getOrganization(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({success: false, message: "query returned 0 rows"});
                    } else {
                        res.status(200).send(result.rows[0]);
                    }
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4003, e.stack, orgId);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9001, error.stack, orgId);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Creates a new organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createOrganization = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var name: string | undefined;
            if (req.body.name) {
                name = req.body.name;
            }
            if (!name) {
                res.status(400).send({success: false, message: "name is required in request body"});
                return;
            }

            await this._postgresService.createOrganization(name)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(null, null, 4004, e.stack, name);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(null, null, 9002, error.stack, null);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Updates an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateOrganization = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var name: string | undefined;
            if (req.body.name) {
                name = req.body.name;
            }
            if (!name) {
                res.status(400).send({success: false, message: "name is required in request body"});
                return;
            }

            await this._postgresService.updateOrganization(orgId, name)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4005, e.stack, orgId);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9003, error.stack, orgId);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Deletes an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteOrganization = async (req: express.Request, res: express.Response): Promise<void> => {
        res.status(501).send({success: false, message: "NOT IMPLEMENTED YET"});
    }

    /**
     * Gets all the user for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganizationUsers = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            await this._postgresService.getOrganizationUsers(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({success: false, message: "query returned 0 rows"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4006, e.stack, orgId);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9004, error.stack, orgId);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Gets a particular user for a given organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganizationUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var subjectId: string | undefined;
            if (req.params.subjectId) {
                subjectId = req.params.subjectId;
            }
            if (!subjectId) {
                res.status(400).send({success: false, message: "subjectId path parameter is required"});
                return;
            }

            await this._postgresService.getOrganizationUser(orgId, subjectId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({success: false, message: "query returned 0 rows"});
                    } else {
                        res.status(200).send(result.rows[0]);
                    }
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4007, e.stack, [orgId, subjectId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9005, error.stack, [orgId, subjectId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Creates a new user for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createOrganizationUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var username: string | undefined;
            if (req.body.username) {
                username = req.body.username;
            }
            if (!username) {
                res.status(400).send({success: false, message: "username is required in request body"});
                return;
            }

            var subjectId: string | undefined;
            if (req.body.subjectid) {
                subjectId = req.body.subjectid;
            }
            if (!subjectId) {
                res.status(400).send({success: false, message: "subjectid is required in request body"});
                return;
            }

            await this._postgresService.createOrganizationUser(orgId, subjectId, username)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4008, e.stack, [orgId, subjectId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9006, error.stack, [orgId, subjectId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Updates a user for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateOrganizationUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {

            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var subjectId: string | undefined;
            if (req.params.subjectId) {
                subjectId = req.params.subjectId;
            }
            if (!subjectId) {
                res.status(400).send({success: false, message: "subjectId path parameter is required"});
                return;
            }

            var newUsername: string | undefined;
            if (req.body.newusername) {
                newUsername = req.body.newusername;
            }
            if (!newUsername) {
                res.status(400).send({success: false, message: "newusername is required in request body"});
                return;
            }

            await this._postgresService.updateOrganizationUser(orgId, subjectId, newUsername)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4009, e.stack, [orgId, subjectId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9007, error.stack, [orgId, subjectId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Deletes a user for an organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteOrganizationUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var subjectId: string | undefined;
            if (req.params.subjectId) {
                subjectId = req.params.subjectId;
            }
            if (!subjectId) {
                res.status(400).send({success: false, message: "subjectId path parameter is required"});
                return;
            }

            await this._postgresService.deleteOrganizationUser(orgId, subjectId)
                .then(result => {
                    res.status(200).send({success: true, message: "user deleted"});
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4010, e.stack, [orgId, subjectId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9008, error.stack, [orgId, subjectId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Gets a list of client credentials for a given organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganizationClients = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }
            await this._postgresService.getOrganizationClients(orgId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({success: false, message: "query returned 0 rows"});
                    } else {
                        res.status(200).send(result.rows);
                    }
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4011, e.stack, orgId);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9009, error.stack, orgId);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Gets a particular client for a given organization
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getOrganizationClient = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }
            var clientId: string | undefined;
            if (req.params.clientId) {
                clientId = req.params.clientId;
            }
            if (!clientId) {
                res.status(400).send({success: false, message: "clientId path parameter is required"});
                return;
            }

            await this._postgresService.getOrganizationClient(orgId, clientId)
                .then(result => {
                    if (result.rowCount == 0) {
                        res.status(404).send({success: false, message: "query returned 0 rows"});
                    } else {
                        res.status(200).send(result.rows[0]);
                    }
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4012, e.stack, [orgId, clientId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9010, error.stack, [orgId, clientId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Creates a new organization client
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createOrganizationClient = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var clientId: string | undefined;
            if (req.body.clientId) {
                clientId = req.body.clientId;
            }
            if (!clientId) {
                res.status(400).send({success: false, message: "clientId is required in request body"});
                return;
            }

            var sourceName: string | undefined;
            if (req.body.sourcename) {
                sourceName = req.body.sourcename;
            }
            if (!sourceName) {
                res.status(400).send({success: false, message: "sourcename is required in request body"});
                return;
            }

            await this._postgresService.createOrganizationClient(orgId, clientId, sourceName)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4013, e.stack, [orgId, clientId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9011, error.stack, [orgId, clientId]);
            res.status(500).send({success: false, message: msg});
        }
    }

    /**
     * Updates an organization client
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateOrganizationClient = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var clientId: string | undefined;
            if (req.params.clientId) {
                clientId = req.params.clientId;
            }
            if (!clientId) {
                res.status(400).send({success: false, message: "clientId path parameter is required"});
                return;
            }

            var sourceName: string | undefined;
            if (req.body.sourcename) {
                sourceName = req.body.sourcename;
            }
            if (!sourceName) {
                res.status(400).send({success: false, message: "sourcename is required in request body"});
                return;
            }

            await this._postgresService.updateOrganizationClient(orgId, clientId, sourceName)
                .then(result => {
                    res.status(200).send(result.rows[0]);
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4014, e.stack, [orgId, clientId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9012, error.stack, [orgId, clientId]);
            res.status(500).send({success: false, message: msg});
        }
        return;
    }

    /**
     * Deletes a organization client
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteOrganizationClient = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            var orgId: number | undefined;
            if (req.params.orgId) {
                orgId = parseInt(req.params.orgId);
            }
            if (!orgId) {
                res.status(400).send({success: false, message: "orgId path parameter is required"});
                return;
            }

            var clientId: string | undefined;
            if (req.params.clientId) {
                clientId = req.params.clientId;
            }
            if (!clientId) {
                res.status(400).send({success: false, message: "clientId path parameter is required"});
                return;
            }

            await this._postgresService.deleteOrganizationClient(orgId, clientId)
                .then(result => {
                    res.status(200).send({success: true, message: "client deleted"});
                })
                .catch(e => {
                    let msg = ErrorService.reportError(orgId, null, 4015, e.stack, [orgId, clientId]);
                    res.status(500).send({success: false, message: msg});
                });
        } catch (error) {
            let msg = ErrorService.reportError(orgId, null, 9013, error.stack, [orgId, clientId]);
            res.status(500).send({success: false, message: msg});
        }
    }
}
