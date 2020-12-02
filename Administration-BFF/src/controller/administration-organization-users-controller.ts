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

import express, { request } from "express";
import path from "path";
import axios from "axios";

import { CommonUtils } from "../utils/common-utils";
import { AdministrationController } from "./administration-controller";
import { AdministrationOrganizationController } from "./administration-organization-controller";
import { AdministrationUsersController } from "./administration-users-controller";
import { ErrorService } from "../services/error-service";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationOrganizationUsersController {

    public router = express.Router();

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor() {

        /**
         * @swagger
         *
         * definitions:
         *    OrgUserSummary:
         *      type: object
         *      properties:
         *        username:
         *          type: string
         *          example:  "john.smith@example.com"
         *        organization_id:
         *          type: number
         *          example: 1
         *        subject_id:
         *          type: string
         *          example: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
         *    OrgUserList:
         *      type: array
         *      items:
         *        $ref: '#/definitions/OrgUserSummary'
         *
         *    Role:
         *      type: object
         *      properties:
         *        id:
         *          type: string
         *          description: "The role ID from App ID"
         *          example: "0aead49b-036a-42b7-ad91-778762be1f7c"
         *        name:
         *          type: string
         *          description: "The role name from App ID"
         *          example: "organization_user"
         *    OrgUser:
         *      type: object
         *      properties:
         *        userId:
         *          type: string
         *          description: "The user's unique Cloud Directory id"
         *          example: "0d81b7d5-97da-477e-88cb-71f61ef8a21a"
         *        subjectId:
         *          type: string
         *          description: "Always an empty string"
         *          example: ""
         *        username:
         *          type: string
         *          description: "The user's login username"
         *          example: "john.smith@example.com"
         *        givenName:
         *          type: string
         *          description: "The user's first (given) name"
         *          example: "John"
         *        familyName:
         *          type: string
         *          description: "The user's last (family) name"
         *          example: "Smith"
         *        displayName:
         *          type: string
         *          description: "The user's full name"
         *          example: "John Smith"
         *        roles:
         *          type: array
         *          items:
         *            $ref: '#/definitions/Role'
         */


        /**
         *  @swagger
         *
         *  /admin/organization/users:
         *    get:
         *      tags: ["Organization Users API"]
         *      summary: "Gets a list organization users"
         *      description: "User must have organization_admin role to perform this function"
         *      responses:
         *        200:
         *            description: "OK"
         *            content:
         *              application/json:
         *                schema:
         *                  $ref: '#/definitions/OrgUserList'
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
         *    post:
         *      tags: ["Organization Users API"]
         *      summary: "Creates a new organization user"
         *      description: "User must have organization_admin role to perform this function"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                username:
         *                  type: string
         *                  description: "The new user's login username (must be unique)"
         *                  example: "john.smith@example.com"
         *                password:
         *                  type: string
         *                  description: "The new user's login password (must be meet configured criteria)"
         *                  example: "1password!"
         *                firstname:
         *                  type: string
         *                  description: "The new user's first (given) name"
         *                  example: "John"
         *                lastname:
         *                  type: string
         *                  description: "The new user's last (family) name"
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
         *        403:
         *          description: "Valid JWT Bearer token required in Authentication header"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/403Response'
         *        401:
         *          description: "Not Authorized"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/401Response'
         *        500:
         *          description: "Internal Server Error"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/500Response'
         *
         */
        this.router.get("/organization/users", this.getAllUsers);
        this.router.post("/organization/users", this.createUser);

        /**
         * @swagger
         *
         *  /admin/organization/users/{username}:
         *    get:
         *      tags: ["Organization Users API"]
         *      summary: "Gets an organization user by their username"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: username
         *          in: path
         *          description: "The user's login user name (email address)."
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
         *    patch:
         *      tags: ["Organization Users API"]
         *      summary: "Updates an organization user"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: username
         *          in: path
         *          description: "The user's login user name (email address)."
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
         *    delete:
         *      tags: ["Organization Users API"]
         *      summary: "Deletes an organization user"
         *      description: "User must have organization_admin role to perform this function"
         *      parameters:
         *        - name: username
         *          in: path
         *          description: "The user's login user name (email address)."
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
         *
         */
        this.router.get("/organization/users/:userName", this.getUser);
        this.router.patch("/organization/users/:userName", this.updateUser);
        this.router.delete("/organization/users/:userName", this.deleteUser);
    }

    /**
     * Gets a list of organization users by calling the organization service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getAllUsers = async (req: express.Request, res: express.Response): Promise<boolean> => {
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

            //call the organization service
            await axios.get(process.env.ORGANIZATION_SERVICE + '/organizations/' + orgId + "/users/")
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        let msg = ErrorService.reportError(orgId, null, 4036, error.stack, [orgId, JSON.stringify(error.response.data)]);
                        res.status(error.response.status).send({ "success": false, "message": msg });
                    } else {
                        let msg = ErrorService.reportError(orgId, null, 4037, error.stack, [orgId, error.message])
                        res.status(500).send({ "success": false, "message": msg });
                    }
                });
        } catch (e) {
            let msg = ErrorService.reportError(orgId, null, 9017, e.stack, [orgId, e.message])
            res.status(500).send({ "success": false, "message": msg });
        }

        return true;
    }


    /**
     * Creates a new organization user by creating the user account in AppID and adding the user to
     * the organization_users table using the organization service.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    createUser = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //check the incoming parameters
            if (!req.body.username || req.body.username.length == 0) {
                res.status(400).send({ "success": false, "message": "username is required in request body" });
                return true;
            }
            if (!req.body.password || req.body.password.length == 0) {
                res.status(400).send({ "success": false, "message": "password is required in request body" });
                return true;
            }
            if (!req.body.firstname || req.body.firstname.length == 0) {
                res.status(400).send({ "success": false, "message": "firstname is required in request body" });
                return true;
            }
            if (!req.body.lastname || req.body.lastname.length == 0) {
                res.status(400).send({ "success": false, "message": "lastname is required in request body" });
                return true;
            }

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

            //create the user in app id
            let userData = await AdministrationUsersController.createUserInAppId(req.body.username,
                req.body.firstname, req.body.lastname, req.body.password);

            //get the user's subject id, the next calls need it
            let subjectId = await AdministrationUsersController.getSubjectIdFromUsername(userData.username);
            if (!subjectId) {
                res.status(404).send({ "success": false, "message": "subject ID not found with username " + userData.username });
                return true;
            }

            //add the user's roles
            let roles = ['organization_user'];
            if (req.body.isadmin) {
                roles.push('organization_admin');
            }
            let updatedRoles = await AdministrationUsersController.addRoleToUserInAppId(subjectId, roles);
            userData.roles = updatedRoles.roles;

            //add them to the organization table
            await AdministrationOrganizationUsersController.createUserInOrganization(req.body.username, orgId, subjectId);

            res.status(200).send(userData);
        } catch (error) {
            if (error.response && error.response.data) {
                if (error.response.status === 403) {
                    let msg = ErrorService.reportError(null, null, 4038, error.stack, [orgId, 'Action is forbidden. Violating the security compliance']);
                    res.status(error.response.status).send({ success: false, message: msg });
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4038, error.stack, [orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send({ "success": false, "message": msg });
                }
            } else {
                let msg = ErrorService.reportError(orgId, null, 4039, error.stack, [orgId, error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }

    /**
     * Gets the user's details
     *
     * @param req
     * @param res
     */
    getUser = async (req: express.Request, res: express.Response): Promise<boolean> => {
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

            let userName = req.params.userName;
            let user = await AdministrationUsersController.getUserInAppIdByUserName(userName);
            if (!user) {
                res.status(404).send({ success: false, message: "No user found for userName " + userName });
                return true;
            }

            let subjectId = await AdministrationUsersController.getSubjectIdFromUsername(userName);
            let rolesData = await AdministrationUsersController.getRolesForUserInAppId(subjectId)
            user.roles = rolesData.roles;

            res.status(200).send(user);

        } catch (error) {
            if (error.response && error.response.data) {
                let msg = ErrorService.reportError(orgId, null, 4040, error.stack, [req.params.userName, orgId, JSON.stringify(error.response.data)]);
                res.status(error.response.status).send({ "success": false, "message": msg });
            } else {
                let msg = ErrorService.reportError(orgId, null, 4041, error.stack, [req.params.userName, orgId, error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }

    /**
     * Updates a new organization user in AppID (change role).
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateUser = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let orgId = '';
        try {
            //check the incoming parameters
            if (!req.body.newusername && !req.body.newfirstname && !req.body.newlastname && !req.body.hasOwnProperty('isadmin')) {
                res.status(400).send({
                    "success": false,
                    "message": "one or more parameters (newusername, newfirstname, newlastname, isadmin) are required in request body"
                });
                return true;
            }

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

            let userName = req.params.userName;
            let user = await AdministrationUsersController.getUserInAppIdByUserName(userName);
            if (!user) {
                res.status(404).send({ success: false, message: "No user found for userName " + userName });
                return true;
            }

            let userId = user.userId;

            /// fix up the data here
            let updatedUserData: any = {
                displayName: user.displayName,
                active: true,
                emails: [
                    {
                        "value": user.username,
                        "primary": true
                    }
                ],
                name: {
                    givenName: user.givenName,
                    familyName: user.familyName,
                    displayName: user.displayName
                }
            };

            if (req.body.newusername) {
                updatedUserData.userName = req.body.newusername;
                updatedUserData.emails = [
                    {
                        "value": updatedUserData.userName,
                        "primary": true
                    }
                ]
            }
            if (req.body.newfirstname) {
                updatedUserData.name.givenName = req.body.newfirstname;
                updatedUserData.name.formatted = updatedUserData.name.givenName + " " + updatedUserData.name.familyName;
                updatedUserData.displayName = updatedUserData.name.formatted;
            }
            if (req.body.newlastname) {
                updatedUserData.name.familyName = req.body.newlastname;
                updatedUserData.name.formatted = updatedUserData.name.givenName + " " + updatedUserData.name.familyName;
                updatedUserData.displayName = updatedUserData.name.formatted;
            }

            //update the user's profile
            let updatedUser = await AdministrationUsersController.updateUserInAppId(userId, updatedUserData);

            let subjectId = await AdministrationUsersController.getSubjectIdFromUsername(userName);

            //update their roles in app id
            if (req.body.hasOwnProperty('isadmin')) {
                let roles = [];
                let rolesListObj = await AdministrationUsersController.getRolesForUserInAppId(subjectId);
                let rolesList = rolesListObj.roles;
                // Check if the user has "hub_admin" role, if present, retain it.
                if (Array.isArray(rolesList) && rolesList.length > 0) {
                    for (let i = 0; i < rolesList.length; i++) {
                        const roleObject = rolesList[i];
                        if (Object.keys(roleObject).length > 0 && roleObject.name && roleObject.name === 'hub_admin') {
                            roles.push('hub_admin');
                            break;
                        }
                    }
                }
                roles.push('organization_user');
                if (req.body.isadmin) {
                    roles.push('organization_admin');
                }
                let newRoles = await AdministrationUsersController.addRoleToUserInAppId(subjectId, roles);
                updatedUser.roles = newRoles.roles;
            } else { // Get the roles to send it in response
                const roleList = await AdministrationUsersController.getRolesForUserInAppId(subjectId);
                updatedUser.roles = roleList.roles;
            }

            //update them to the organization table only if their userName changed
            if (req.body.newusername && userName != req.body.newusername) {
                await AdministrationOrganizationUsersController.updateUserInOrganization(subjectId, orgId, req.body.newusername);
            }

            res.status(200).send(updatedUser);
        } catch (error) {
            if (error.response && error.response.data) {
                if (error.response.status === 403) {
                    let msg = ErrorService.reportError(null, null, 4042, error.stack, [req.params.userName, orgId, 'Action is forbidden. Violating the security compliance']);
                    res.status(error.response.status).send({ success: false, message: msg });
                } else {
                    let msg = ErrorService.reportError(orgId, null, 4042, error.stack, [req.params.userName, orgId, JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send({ "success": false, "message": msg });
                }
            } else {
                let msg = ErrorService.reportError(orgId, null, 4045, error.stack, [req.params.userName, orgId, error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }

    /**
     * Deletes an organization user by deleting the user account in AppID and removing the user from
     * the organization_users table using the organization service.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    deleteUser = async (req: express.Request, res: express.Response): Promise<boolean> => {
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

            let userName = req.params.userName;

            //delete the user from the organization
            let subjectId = await AdministrationUsersController.getSubjectIdFromUsername(userName);
            await AdministrationOrganizationUsersController.deleteUserInOrganization(subjectId, orgId);


            let user = await AdministrationUsersController.getUserInAppIdByUserName(userName);
            if (!user) {
                res.status(404).send({ success: false, message: "No user found for userName " + userName });
                return true;
            }

            //delete the user in app id
            await AdministrationUsersController.deleteUserInAppID(user.userId);

            res.status(200).send({ success: true, message: "user deleted" });

        } catch (error) {
            if (error.response && error.response.data) {
                let msg = ErrorService.reportError(orgId, null, 4044, error.stack, [req.params.userName, orgId, JSON.stringify(error.response.data)]);
                res.status(error.response.status).send({ "success": false, "message": msg });
            } else {
                let msg = ErrorService.reportError(orgId, null, 4043, error.stack, [req.params.userName, orgId, error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }

    /******* STATIC FUNCTIONS FOR MANAGING USERS IN THE ORGANIZATION TABLES ***********/

    /**
     * Creates the user in the organization
     *
     * @param username
     * @param orgId
     * @param subjectId
     */
    public static createUserInOrganization = async (username: string, orgId: string, subjectId: string): Promise<boolean> => {

        //create the payload
        const data = {
            username: username,
            subjectid: subjectId
        };

        //call the organization service
        await axios.post(process.env.ORGANIZATION_SERVICE + '/organizations/' + orgId + "/users/", data)
            .then((response) => {
                //ok do nothing
            }, (error) => {
                throw error;
            }
            );
        return true;
    }

    /**
     * Updates the user in the organization
     *
     * @param originalUsername
     */
    public static updateUserInOrganization = async (subjectId: string, orgId: string, newUsername: string): Promise<boolean> => {

        //create the payload
        const data = {
            newusername: newUsername
        };
        //call the organization service
        await axios.patch(process.env.ORGANIZATION_SERVICE + '/organizations/' + orgId + "/users/" + subjectId, data)
            .then((response) => {
                //ok do nothing
            }, (error) => {
                throw error;
            }
            );
        return true;
    }

    /**
     * Deletes the user in the organization
     *
     * @param subjectId
     * @param orgId
     */
    public static deleteUserInOrganization = async (subjectId: string, orgId: string): Promise<boolean> => {

        //call the organization service
        await axios.delete(process.env.ORGANIZATION_SERVICE + '/organizations/' + orgId + "/users/" + subjectId)
            .then((response) => {
                //ok do nothing
            }, (error) => {
                throw error;
            }
            );
        return true;
    }
}