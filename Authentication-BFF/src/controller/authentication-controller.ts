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
 * EPCIS MESSAGING HUB - AUTHENTICATION BFF

 */

import express from "express";
import axios from "axios";
import JwtDecode from "jwt-decode";
import { ErrorService } from "../services/error-service";

let querystring = require('querystring');


/**
 * This is the main controller for the Authentication BFF service.
 * This BFF (backend-for-frontend) is intended to be a publicly-accessible
 * API for external services and application to authenticate with the OAUTH server.
 */

export class AuthenticationController {

    public router = express.Router();
    private currentIAMToken: any;

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
         *  500Response:
         *     type: object
         *     properties:
         *       success:
         *         type: boolean
         *         example: false
         *       message:
         *         type: string
         *         example: "An error has occurred..."
         */


        /**
         * @swagger
         *
         * /oauth/token:
         *  post:
         *    tags: ["Authentication API"]
         *    summary: "Returns a set of tokens on successful authentication"
         *    requestBody:
         *      content:
         *        application/json:
         *          schema:
         *            type: object
         *            required: ["grant_type"]
         *            properties:
         *              grant_type:
         *                description: "OAuth2 grant type"
         *                type: string
         *                enum: ["password", "client_credentials", "refresh_token"]
         *                example: "password"
         *              username:
         *                description: "The resource owner username on grant_type password flow this parameter is required."
         *                type: string
         *                example": "Jessica.Smith@ibm.com"
         *              password:
         *                description: "The resource owner password on grant_type password flow this parameter is required."
         *                type: string
         *                format: "password"
         *                example: "12345678"
         *              client_id:
         *                type: string
         *                description: "The client id on client_credentials flow this parameter is required."
         *              client_secret:
         *                type: string
         *                description: "The client secret on client_credentials flow this parameter is required."
         *              refresh_token:
         *                description: "Used to issue a new access token when having a valid refresh token. Required for grant_type refresh_token."
         *                type: string
         *                example: "eJYdAskd2dfskadjkeLKWwrQmxPIaKL"
         *    responses:
         *      200:
         *        description: "OK"
         *        content:
         *          application/json:
         *            schema:
         *              type: "object"
         *              properties:
         *                access_token:
         *                  type: string
         *                  example: "JALKjlzlkJLOI23enlLZJLCKnLKASd..."
         *                id_token:
         *                  type: string
         *                  example: "KLAskd0aoskaojk3LKAJLkmxPIAS..."
         *                refresh_token:
         *                  type: string
         *                  example: "eJYdAskd2dfskadjkeLKWwrQmxPIaKL..."
         *                token_type:
         *                  type: string
         *                  example: "Bearer"
         *                expires_in:
         *                  type: "integer"
         *                  example: 3600
         *      400:
         *        description: "Bad Request - Wrong or missing values"
         *        content:
         *          application/json:
         *            schema:
         *              $ref: "#/definitions/400Response"
         *      500:
         *        description: "Internal Server Error"
         *        content:
         *          application/json:
         *            schema:
         *              $ref: "#/definitions/500Response"
         */
        this.router.post("/token", this.getToken);


        /**
         * @swagger
         *
         * /oauth/revoke:
         *    post:
         *      tags: ["Authentication API"]
         *      summary: "Revokes current access token and refresh tokens"
         *      operationId: "revokeAccessToken"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                refresh_token:
         *                  description: "App ID refresh token."
         *                  type: string
         *                  example: "eJYdAskd2dfskadjkeLKWwrQmxPIaKL"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        400:
         *          description: "Bad Request - Bad or missing refresh token passed"
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
         *
         */
        this.router.post("/revoke", this.revokeToken);

        /**
         * @swagger
         *
         * /oauth/forgotpassword:
         *    post:
         *      tags: ["Authentication API"]
         *      summary: "Intiates the forgot password flow for a registered user"
         *      operationId: "forgotPassword"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                username:
         *                  type: string
         *                  description: "The user's username (email formatted)"
         *                  format: email
         *                  example: "john.smith@example.com"
         *                language:
         *                  type: string
         *                  example: "en"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        400:
         *          description: "Bad Request - Bad or missing username/email"
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
        this.router.post("/forgotpassword", this.forgotPassword);

        /**
         * @swagger
         *
         *  /oauth/forgotpassword/confirm:
         *    post:
         *      tags:
         *        - "Authentication API"
         *      summary: "Confirms the validity of forgot password flow for a registered user"
         *      operationId: "confirmForgotPassword"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                context:
         *                  type: string
         *                  description: "A context token received via email from App Id"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        400:
         *          description: "Bad Request - Bad or missing username/email"
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
        this.router.post("/forgotpassword/confirm", this.confirmForgotPassword);

        /**
         * @swagger
         *
         *  /oauth/changepassword:
         *    post:
         *      tags:
         *        - "Authentication API"
         *      summary: "Changes a user's password"
         *      operationId: "changePassword"
         *      requestBody:
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              required: ["uuid", "password"]
         *              properties:
         *                uuid:
         *                  type: string
         *                  description: "The user's unique identifier (not their username) in App ID"
         *                password:
         *                  type: string
         *                  description: "The user's new password"
         *                language:
         *                  type: string
         *                  description: "Language to use in the email confirmation"
         *      responses:
         *        200:
         *          description: "OK"
         *          content:
         *            application/json:
         *              schema:
         *                $ref: '#/definitions/200Response'
         *        400:
         *          description: "The tenantId, uuid or newPassword is missing or invalid."
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
        this.router.post("/changepassword", this.changePassword);
    }

    /**
     * Gets an access token from the OAUTH server based on the grant type and credential
     * submitted by the caller.
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getToken = async (req: express.Request, res: express.Response): Promise<boolean> => {

        let data = {};
        let options = {};

        //check the parameters
        if (req.body == null) {
            res.status(400).send({ success: false, message: "request body is missing" });
            return false;
        }
        if (req.body.grant_type == null) {
            res.status(400).send({ success: false, message: "grant_type parameter is missing" });
            return false;
        }

        //construct the request payload based on the requested grant type
        if (req.body.grant_type === 'password') {
            if (req.body.username == null || req.body.username === '') {
                res.status(400).send({
                    success: false,
                    message: "username parameter is required when grant_type is password"
                });
                return false;
            }
            if (req.body.password == null || req.body.password === '') {
                res.status(400).send({
                    success: false,
                    message: "password parameter is required when grant_type is password"
                });
                return false;
            }

            options = {
                auth:
                {
                    username: process.env.CLIENT_ID,
                    password: process.env.CLIENT_SECRET
                }
            };

            data = {
                grant_type: 'password',
                username: req.body.username,
                password: req.body.password
            };
        } else if (req.body.grant_type === 'client_credentials') {
            if (req.body.client_id == null || req.body.client_id === '') {
                res.status(400).send({
                    success: false,
                    message: "client_id parameter is required when grant_type is client_credentials"
                });
                return false;
            }
            if (req.body.client_secret == null || req.body.client_secret === '') {
                res.status(400).send({
                    success: false,
                    message: "client_secret parameter is required when grant_type is client_credentials"
                });
                return false;
            }
            options = {
                auth:
                {
                    username: req.body.client_id,
                    password: req.body.client_secret
                }
            };

            data = { grant_type: 'client_credentials' };

        } else if (req.body.grant_type === 'refresh_token') {
            if (req.body.refresh_token == null || req.body.refresh_token === '') {
                res.status(400).send({
                    success: false,
                    message: "refresh_token parameter is required when grant_type is refresh_token"
                });
                return false;
            }

            options = {
                auth:
                {
                    username: process.env.CLIENT_ID,
                    password: process.env.CLIENT_SECRET
                }
            };

            data = {
                grant_type: 'refresh_token',
                refresh_token: req.body.refresh_token
            };
        } else {
            res.status(400).send({
                success: false,
                message: "grant_type must be 'password', 'refresh_token' or 'client_credentials'"
            });
            return false;
        }

        try {
            const querydata = querystring.stringify(data);
            //call the oauth server with the grant type and properly formatted credential payloads
            let url = (process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT
            await axios.post(url, querydata, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        if (error.response.status === 403) {
                            let msg = ErrorService.reportError(null, null, 4001, error.stack, 'Action is forbidden. Violating the security compliance');
                            res.status(error.response.status).send({ success: false, message: msg });
                        } else {
                            let msg = ErrorService.reportError(null, null, 4001, error.stack, error.response.data.error_description);
                            res.status(error.response.status).send({ success: false, message: msg });
                        }
                    } else {
                        let msg = ErrorService.reportError(null, null, 4001, error.stack, error.message);
                        res.status(500).send({ success: false, message: msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9000, e.stack, e.message);
            res.status(500).send({ success: false, message: msg });
        }

        return true;
    }

    /**
     * Calls the OAUTH server to revoke the user's tokens
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    revokeToken = async (req: express.Request, res: express.Response): Promise<boolean> => {

        //check the parameters
        if (req.body == null) {
            res.status(400).send({ success: false, message: "request body is missing" });
            return false;
        }

        if (req.body.refresh_token == null || req.body.refresh_token === '') {
            res.status(400).send({ success: false, message: "refresh_token parameter is missing" });
            return false;
        }

        try {
            //construct the payloads
            let options: any = {
                auth: {
                    username: process.env.CLIENT_ID,
                    password: process.env.CLIENT_SECRET
                }
            };

            const data: any = {
                token: req.body.refresh_token
            };
            const querydata = querystring.stringify(data);
            //call the oauth server
            let url = (process.env.OAUTH_SERVER as string) + process.env.REVOKE_ENDPOINT;
            await axios.post(url, querydata, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        if (error.response.status === 403) {
                            let msg = ErrorService.reportError(null, null, 4002, error.stack, 'Action is forbidden. Violating the security compliance');
                            res.status(error.response.status).send({ success: false, message: msg });
                        } else {
                            let msg = ErrorService.reportError(null, null, 4002, error.stack, error.response.data.error_description);
                            res.status(error.response.status).send({ success: false, message: msg });
                        }
                    } else {
                        let msg = ErrorService.reportError(null, null, 4002, error.stack, error.message);
                        res.status(500).send({ success: false, message: msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9001, e.stack, e.message);
            res.status(500).send({ success: false, message: msg });
        }

        return true;
    }

    /**
     * Calls the OAUTH/User Management server's endpoint for initiating the forgot/reset password flow
     * But first calls the IAM server to get the necessary access token (APP ID specific)
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    forgotPassword = async (req: express.Request, res: express.Response): Promise<boolean> => {
        //check the parameters
        if (req.body == null) {
            res.status(400).send({ success: false, message: "request body is missing" });
            return false;
        }

        if (req.body.username == null || req.body.username === '') {
            res.status(400).send({ success: false, message: "username parameter is missing" });
            return false;
        }

        try {
            let iamToken = await this.getIAMToken();

            const options = {
                headers: {
                    'Authorization': "Bearer " + iamToken
                }
            };

            const data = {
                user: req.body.username
            };
            const querydata = querystring.stringify(data);
            // call the OAUTH/User Management server to initiate the forgot password flow
            let url = (process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_ENDPOINT;
            await axios.post(url, querydata, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        if (error.response.status === 403) {
                            let msg = ErrorService.reportError(null, null, 4003, error.stack, 'Action is forbidden. Violating the security compliance');
                            res.status(error.response.status).send({ success: false, message: msg });
                        } else {
                            let msg = ErrorService.reportError(null, null, 4003, error.stack, error.response.data.error_description);
                            res.status(error.response.status).send({ success: false, message: msg });
                        }
                    } else {
                        let msg = ErrorService.reportError(null, null, 4003, error.stack, error.message);
                        res.status(500).send({ success: false, message: msg });
                    }
                }
                );

        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9002, e.stack, e.message);
            res.status(500).send({ success: false, message: msg });
        }

        return true;
    }

    /**
     * Calls the OAUTH/User Management server to confirm the validity of the reset token the user is presenting
     * The user would have received this token in an email sent by the OAUTH server.
     * But first calls the IAM server to get the necessary access token (APP ID specific)
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    confirmForgotPassword = async (req: express.Request, res: express.Response): Promise<boolean> => {
        //check the parameters
        if (req.body == null) {
            res.status(400).send({ success: false, message: "request body is missing" });
            return false;
        }

        if (req.body.context == null || req.body.context === '') {
            res.status(400).send({ success: false, message: "context parameter is missing" });
            return false;
        }

        try {
            let iamToken = await this.getIAMToken();

            const options = {
                headers: {
                    'Authorization': "Bearer " + iamToken
                }
            };

            const data = {
                context: req.body.context
            };
            const querydata = querystring.stringify(data);
            //Call the OAUTH/User Management server to confirm the token
            let url = (process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_CONFIRM_ENDPOINT;
            await axios.post(url, querydata, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        if (error.response.status === 403) {
                            let msg = ErrorService.reportError(null, null, 4004, error.stack, 'Action is forbidden. Violating the security compliance');
                            res.status(error.response.status).send({ success: false, message: msg });
                        } else {
                            let msg = ErrorService.reportError(null, null, 4004, error.stack, error.response.data.error_description);
                            res.status(error.response.status).send({ success: false, message: msg });
                        }
                    } else {
                        let msg = ErrorService.reportError(null, null, 4004, error.stack, error.message);
                        res.status(500).send({ success: false, message: msg });
                    }
                }
                );

        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9003, e.stack, e.message);
            res.status(500).send({ success: false, message: msg });
        }

        return true;
    }

    /**
     * Calls the OAUTH/User Management server to change the user's password.
     * But first calls the IAM server to get the necessary access token (APP ID specific)
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    changePassword = async (req: express.Request, res: express.Response): Promise<boolean> => {
        //check the parameters
        if (req.body == null) {
            res.status(400).send({ success: false, message: "request body is missing" });
            return false;
        }

        if (req.body.uuid == null || req.body.uuid === '') {
            res.status(400).send({ success: false, message: "uuid parameter is missing" });
            return false;
        }

        if (req.body.password == null || req.body.password === '') {
            res.status(400).send({ success: false, message: "password parameter is missing" });
            return false;
        }

        try {
            let iamToken = await this.getIAMToken();
            const options = {
                headers: {
                    'Authorization': "Bearer " + iamToken
                }
            };

            const data = {
                uuid: req.body.uuid,
                newPassword: req.body.password
            };
            const querydata = querystring.stringify(data);
            //call the OAUTH/User Management server to change the password
            let url = (process.env.MANAGEMENT_SERVER as string) + process.env.CHANGE_PASSWORD_ENDPOINT;
            await axios.post(url, querydata, options)
                .then((response) => {
                    res.status(response.status).send(response.data);
                }, (error) => {
                    if (error.response && error.response.data) {
                        if (error.response.status === 403) {
                            let msg = ErrorService.reportError(null, null, 4005, error.stack, 'Action is forbidden. Violating the security compliance');
                            res.status(error.response.status).send({ success: false, message: msg });
                        } else {
                            let msg = ErrorService.reportError(null, null, 4005, error.stack, error.response.data.error);
                            res.status(error.response.status).send({ success: false, message: msg });
                        }
                    } else {
                        let msg = ErrorService.reportError(null, null, 4005, error.stack, error.message);
                        res.status(500).send({ success: false, message: msg });
                    }
                }
                );
        } catch (e) {
            let msg = ErrorService.reportError(null, null, 9004, e.stack, e.message);
            res.status(500).send({ success: false, message: msg });
        }

        return true;
    }

    /**
     * Gets an IAM token
     */
    private getIAMToken = async (): Promise<string | undefined> => {

        let validToken = false;
        //check if there is a current, unexpired token
        if (this.currentIAMToken) {
            let decoded: any = JwtDecode(this.currentIAMToken);
            let expire: number = decoded.exp;
            if (expire && (Date.now() < expire * 1000)) {
                validToken = true;
            } else {
                this.currentIAMToken = undefined;
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
                    this.currentIAMToken = response.data.access_token;
                }, (error) => {
                    throw error;
                }
                );
        }
        return this.currentIAMToken;
    }
}