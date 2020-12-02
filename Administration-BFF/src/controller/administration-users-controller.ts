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

import { CommonUtils } from "../utils/common-utils";
import { AdministrationOrganizationController } from "./administration-organization-controller";
import JwtDecode from "jwt-decode";
import { AdministrationOrganizationUsersController } from "./administration-organization-users-controller";
import { AdministrationController } from "./administration-controller";
import { ErrorService } from "../services/error-service";

let querystring = require('querystring');
let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This is the main controller for the Administration BFF service.
 * This BFF (backend-for-frontend) is tailored for use by
 * the Messaging Hub's Administration UI.
 */
export class AdministrationUsersController {

    public router = express.Router();
    private static currentIAMToken: any;

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
         *  500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
         *  SelfUser:
         *    type: object
         *    properties:
         *      userId:
         *        type: string
         *        description: "The user's unique Cloud Directory id"
         *        example: "0d81b7d5-97da-477e-88cb-71f61ef8a21a"
         *      subjectId:
         *        type: string
         *        description: "Always an empty string"
         *        example: ""
         *      username:
         *        type: string
         *        description: "The user's login username"
         *        example: "john.smith@example.com"
         *      givenName:
         *        type: string
         *        description: "The user's first (given) name"
         *        example: "John"
         *      familyName:
         *        type: string
         *        description: "The user's last (family) name"
         *        example: "Smith"
         *      displayName:
         *        type: string
         *        description: "The user's full name"
         *        example: "John Smith"
         *      roles:
         *        type: array
         *        items: string
         *        description: "Always an empty array"
         *        example: []
         */

        /**
         * @swagger
         *  /admin/user/:
         *    get:
         *      tags: ["User API"]
         *      summary: "Gets the logged in user's profile"
         *      description: "This is for the current signed in user to view their own user data"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/SelfUser'
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
         *      tags: ["User API"]
         *      summary: "Updates the logged in user's profile"
         *      description: "This is for the current signed in user to edit their own user data"
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
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/SelfUser'
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
         */
        this.router.get("/user", this.getSelf);
        this.router.patch("/user", this.updateSelf);


    }

    /**
     * Gets the User details from the OAUTH server
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getSelf = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            //check that we have an access token
            let access_token = req.headers.authorization;
            if (!access_token || access_token === '') {
                res.status(401).send({ "success": false, "message": "No token in authorization header" });
                return false;
            }
            //get the user info
            let userTokenDetails = await AdministrationUsersController.getUserFromAccessToken(access_token);
            res.send(userTokenDetails);

        } catch (error) {
            if (error.response && error.response.data) {
                if (error.response.status === 403) {
                    let msg = ErrorService.reportError(null, null, 4106, error.stack, ['Action is forbidden. Violating the security compliance']);
                    res.status(error.response.status).send({ success: false, message: msg });
                } else {
                    let msg = ErrorService.reportError(null, null, 4106, error.stack, [JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send({ success: false, message: msg });
                }
            } else {
                let msg = ErrorService.reportError(null, null, 4107, error.stack, [error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }


    /**
     * Updates a user's name or email addresses in the OAUTH/User Management server
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    updateSelf = async (req: express.Request, res: express.Response): Promise<boolean> => {
        try {
            //check the incoming parameters
            if (!req.body.newusername && !req.body.newfirstname && !req.body.newlastname) {
                res.status(400).send({
                    "success": false,
                    "message": "one or more parameters (newusername, newfirstname, newlastname) are required in request body"
                });
                return true;
            }

            //check that we have an access token
            let access_token = req.headers.authorization;
            if (!access_token || access_token === '') {
                res.status(401).send({ "success": false, "message": "No token in authorization header" });
                return false;
            }

            //get the user's current profile
            let userDetails = await AdministrationUsersController.getUserFromAccessToken(access_token);

            // create an updated user profile
            let userId = userDetails.userId;
            let originalUserName = userDetails.username;
            let newUserData: any = {
                active: true,
                userName: userDetails.username,
                displayName: userDetails.displayName,
                name: {
                    givenName: userDetails.givenName,
                    familyName: userDetails.familyName,
                    formatted: userDetails.displayName,
                },
                emails: [
                    {
                        "value": userDetails.username,
                        "primary": true
                    }
                ]
            };

            if (req.body.newusername) {
                newUserData.userName = req.body.newusername;
                newUserData.emails = [
                    {
                        "value": newUserData.userName,
                        "primary": true
                    }
                ]
            }
            if (req.body.newfirstname) {
                newUserData.name.givenName = req.body.newfirstname;
                newUserData.name.formatted = newUserData.name.givenName + " " + newUserData.name.familyName;
                newUserData.displayName = newUserData.name.formatted;
            }
            if (req.body.newlastname) {
                newUserData.name.familyName = req.body.newlastname;
                newUserData.name.formatted = newUserData.name.givenName + " " + newUserData.name.familyName;
                newUserData.displayName = newUserData.name.formatted;
            }

            //update the profile in App ID
            let userProfile = await AdministrationUsersController.updateUserInAppId(userId, newUserData);

            //if the username changed, then update the user in the org
            if (req.body.newusername && req.body.newusername !== originalUserName) {
                let orgId = '';
                await AdministrationOrganizationController.getOrganizationId(req, res).then((id) => {
                    orgId = id
                });
                if (orgId === '') {
                    return false;
                }

                let subjectId = AdministrationController.getSubjectId(req);
                await AdministrationOrganizationUsersController.updateUserInOrganization(subjectId, orgId, req.body.newusername);
            }

            res.status(200).send(userProfile);

        } catch (error) {
            if (error.response && error.response.data) {
                if (error.response.status === 403) {
                    let msg = ErrorService.reportError(null, null, 4108, error.stack, ['Action is forbidden. Violating the security compliance']);
                    res.status(error.response.status).send({ success: false, message: msg });
                } else {
                    let msg = ErrorService.reportError(null, null, 4108, error.stack, [JSON.stringify(error.response.data)]);
                    res.status(error.response.status).send({ success: false, message: msg });
                }
            } else {
                let msg = ErrorService.reportError(null, null, 4109, error.stack, [error.message])
                res.status(500).send({ "success": false, "message": msg });
            }
        }

        return true;
    }



    /******* STATIC FUNCTIONS FOR MANAGING APP ID/CLOUD DIRECTORY ***********/


    /**
     * Gets an IAM token
     */
    public static getIAMToken = async (): Promise<string | undefined> => {

        let validToken = false;
        //check if there is a current, unexpired token
        if (AdministrationUsersController.currentIAMToken) {
            let decoded: any = JwtDecode(AdministrationUsersController.currentIAMToken);
            let expire: number = decoded.exp;
            if (expire && (Date.now() < expire * 1000)) {
                validToken = true;
            } else {
                AdministrationUsersController.currentIAMToken = undefined;
            }
        }

        //if not, then fetch a new token
        if (!validToken) {
            //construct the required payload (may be OAUTH server specific)
            const iam_data = {
                grant_type: 'urn:ibm:params:oauth:grant-type:apikey', //APP ID specific
                apikey: process.env.APIKEY
            };

            //call the IAM server to get an IAM access token
            let url = (process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT;
            await axios.post(url, querystring.stringify(iam_data))
                .then((response) => {
                    AdministrationUsersController.currentIAMToken = response.data.access_token;
                }, (error) => {
                    throw error;
                }
                );
        }
        return AdministrationUsersController.currentIAMToken;
    }

    /**
     * Gets the user details for the access token presented
     *
     * @param accessToken
     */
    private static getUserFromAccessToken = async (accessToken: string): Promise<any> => {

        //pass the token in the header
        const options = {
            headers: {
                'Authorization': accessToken
            }
        };
        //call the OAUTH server to get user info from their access token
        let userProfile: any;
        let url = (process.env.OAUTH_SERVER as string) + process.env.USERINFO_ENDPOINT;
        await axios.get(url, options)
            .then((response) => {
                //sometimes this comes in different fields.
                let username = response.data.preferred_username ? response.data.preferred_username : response.data.email;
                userProfile = {
                    userId: response.data.identities[0].id,
                    subjectId: response.data.sub,
                    username: username,
                    givenName: response.data.given_name,
                    familyName: response.data.family_name,
                    displayName: response.data.name,
                    roles: []
                };
            }, (error) => {
                throw error;
            }
            );

        return userProfile;
    }

    /**
     *
     * @param userId
     */
    public static getUserInAppIdByUserName = async (userName: string): Promise<any> => {

        //This call requires an IAM toke, pass the token in the header
        let iamToken = await AdministrationUsersController.getIAMToken();
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        //search for the user
        let url = (process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users?count=1&query=" + userName;
        let userProfile: any;
        await axios.get(url, options)
            .then((response) => {
                if (response.data.Resources && response.data.Resources.length > 0) {
                    userProfile = {
                        userId: response.data.Resources[0].id,
                        subjectId: '', //this api doesn't return this
                        username: response.data.Resources[0].emails[0].value,
                        givenName: response.data.Resources[0].name.givenName,
                        familyName: response.data.Resources[0].name.familyName,
                        displayName: response.data.Resources[0].name.formatted,
                        roles: []
                    };
                }
            }, (error) => {
                throw error;
            }
            );

        return userProfile;
    }

    /**
     *
     * @param username
     */
    public static getSubjectIdFromUsername = async (username: string): Promise<any> => {
        //This call requires an IAM toke, pass the token in the header
        let iamToken = await AdministrationUsersController.getIAMToken();
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        //search for the user
        let url = (process.env.MANAGEMENT_SERVER as string) + "/users?dataScope=index&count=1&email=" + username;
        let subjectId: any;
        await axios.get(url, options)
            .then((response) => {
                if (response.data.users && response.data.users.length > 0) {
                    subjectId = response.data.users[0].id
                }
            }, (error) => {
                throw error;
            }
            );

        return subjectId;
    }

    /**
     * Create a new user in App ID/Cloud Directory
     *
     * @param username
     * @param firstname
     * @param lastname
     * @param password
     */
    public static createUserInAppId = async (username: string, firstname: string, lastname: string, password: string): Promise<any> => {

        //first create the profile
        await AdministrationUsersController.createUserProfileInAppId(username);

        //build the payload
        let userData = {
            active: true,
            displayName: firstname + " " + lastname,
            emails: [
                {
                    value: username,
                    primary: true
                }
            ],
            name: {
                givenName: firstname,
                familyName: lastname,
                formatted: firstname + " " + lastname,
            },
            userName: username,
            password: password
        };

        //Need an IAM token to call this endpoint, pass the token in the header
        let iamToken = await AdministrationUsersController.getIAMToken();
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        //Call the Cloud Directory API
        let userProfile;
        let url = (process.env.MANAGEMENT_SERVER as string) + "/cloud_directory/Users";
        await axios.post(url, userData, options)
            .then((response) => {
                userProfile = {
                    userId: response.data.id,
                    subjectId: "", //no subject id returned from this call.
                    username: response.data.userName,
                    givenName: response.data.name.givenName,
                    familyName: response.data.name.familyName,
                    displayName: response.data.name.formatted,
                    roles: []
                };
            }, (error) => {
                throw error;
            }
            );
        return userProfile;
    }

    /**
     *
     * @param userId
     */
    private static createUserProfileInAppId = async (userId: string): Promise<any> => {

        //build the payload
        const userData = {
            "idp": "cloud_directory",
            "idp-identity": userId
        }

        //Need an IAM token to call this endpoint, pass the token in the header
        let iamToken = await AdministrationUsersController.getIAMToken();
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        //Call the User Management API
        let url = (process.env.MANAGEMENT_SERVER as string) + "/users";
        let returnedData;
        await axios.post(url, userData, options)
            .then((response) => {
                returnedData = response.data;
            }, (error) => {
                throw error;
            }
            );
        return returnedData;
    }

    /**
     * Updates the user's data
     *
     * @param userId
     * @param newUserData
     */
    public static updateUserInAppId = async (userId: string, newUserData: any): Promise<any> => {

        let iamToken = await AdministrationUsersController.getIAMToken();

        //pass the token in the header
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        let userProfile;
        // call the OAUTH/User Management server to update the user
        let url = (process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/Users/' + userId;
        await axios.put(url, newUserData, options)
            .then((response) => {
                userProfile = {
                    userId: response.data.id,
                    subjectId: "", //no subject id returned from this call.
                    username: response.data.userName,
                    givenName: response.data.name.givenName,
                    familyName: response.data.name.familyName,
                    displayName: response.data.name.formatted,
                    roles: []
                };
            }, (error) => {
                throw error;
            }
            );
        return userProfile;
    }


    /**
     * Deletes a user from App ID
     *
     * @param userId
     */
    public static deleteUserInAppID = async (userId: string): Promise<any> => {

        let iamToken = await AdministrationUsersController.getIAMToken();

        //pass the token in the header
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        // call the OAUTH/User Management server to update the user
        let url = (process.env.MANAGEMENT_SERVER as string) + '/cloud_directory/remove/' + userId;
        await axios.delete(url, options)
            .then((response) => {
                // do nothing
            }, (error) => {
                throw error;
            }
            );
        return true;
    }

    /**
     * Gets the roles for a user from App Id
     *
     * @param userId
     */
    public static getRolesForUserInAppId = async (userId: string): Promise<any> => {

        let iamToken = await AdministrationUsersController.getIAMToken();

        //pass the token in the header
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        let url = (process.env.MANAGEMENT_SERVER as string) + "/users/" + userId + "/roles";
        let roles;
        await axios.get(url, options)
            .then((response) => {
                roles = response.data;
            }, (error) => {
                throw error;
            }
            );
        return roles;
    }

    /**
     * Add roles to the user
     *
     * @param userId
     * @param roles
     */
    public static addRoleToUserInAppId = async (userId: string, roles: any): Promise<any> => {

        let iamToken = await AdministrationUsersController.getIAMToken();

        //pass the token in the header
        const options = {
            headers: {
                'Authorization': 'Bearer ' + iamToken
            }
        };

        //first get the roles and match up the name to get the id
        let roleIds: any[] = [];
        let url = (process.env.MANAGEMENT_SERVER as string) + "/roles";
        await axios.get(url, options)
            .then((response) => {
                let rolesData = response.data.roles;
                for (let i = 0; i < rolesData.length; i++) {
                    for (let j = 0; j < roles.length; j++) {
                        if (roles[j] === rolesData[i].name) {
                            roleIds.push(rolesData[i].id)
                        }
                    }
                }
            }, (error) => {
                throw error;
            }
            );

        //now set those roles for the user
        let payload = {
            roles: {
                ids: roleIds
            }
        };

        let url2 = (process.env.MANAGEMENT_SERVER as string) + "/users/" + userId + "/roles";
        let updatedRoles;
        await axios.put(url2, payload, options)
            .then((response) => {
                updatedRoles = response.data;
            }, (error) => {
                throw error;
            }
            );
        return updatedRoles;
    }
}