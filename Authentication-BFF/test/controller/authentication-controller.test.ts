/*
 * EPCIS MESSAGING HUB - AUTHENTICATION BFF

 */

import {AuthenticationController} from "../../src/controller/authentication-controller";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

const {mockRequest, mockResponse} = require('../utils/interceptor')

describe("Check class \'AuthenticationController\' ", () => {

    beforeEach(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if (!process.env.OAUTH_SERVER) {
            process.env = {
                OAUTH_SERVER: "https://oauth-server.com",
                TOKEN_ENDPOINT: "/token",
                REVOKE_ENDPOINT: "/revoke",
                CLIENT_ID: "clientid",
                CLIENT_SECRET: "clientsecret",
                IAM_SERVER: "https://iam-server.com",
                IAM_TOKEN_ENDPOINT: "/token",
                MANAGEMENT_SERVER: "https://management-server.com",
                FORGOT_PASSWORD_ENDPOINT: "/forgotpassword",
                FORGOT_PASSWORD_CONFIRM_ENDPOINT: "/confirm",
                CHANGE_PASSWORD_ENDPOINT: "/changepassword"
            };
        }
    });

    /*---- missing or unknown grants ----*/
    test('getToken password grant should 400 when missing request body', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body = null;

        let response = {
            success: false,
            message: "request body is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken unknown grant should 400 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "unknown";

        let response = {
            success: false,
            message: "grant_type must be 'password', 'refresh_token' or 'client_credentials'"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    /*---- password grants ----*/
    test('getToken password grant should 400 when missing grant type', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.password = "password";
        req.body.username = "username";

        let response = {
            success: false,
            message: "grant_type parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken password grant should 400 when missing password', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "password";
        req.body.username = "username";

        let response = {
            success: false,
            message: "password parameter is required when grant_type is password"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken password grant should 400 when missing username', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "password";
        req.body.password = "password"

        let response = {
            success: false,
            message: "username parameter is required when grant_type is password"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken password grant should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        req.body.grant_type = "password";
        req.body.username = "username";
        req.body.password = "password"

        let response = {
            "access_token": "JALKjlzlkJLOI23enlLZJLCKnLKASd",
            "id_token": "KLAskd0aoskaojk3LKAJLkmxPIAS",
            "refresh_token": "eJYdAskd2dfskadjkeLKWwrQmxPIaKL",
            "token_type": "Bearer",
            "expires_in": 3600
        }
        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    /*---- client_credentials grants ----*/
    test('getToken client credential grant should 400 and return error when client id is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "client_credentials";

        let response = {
            success: false,
            message: "client_id parameter is required when grant_type is client_credentials"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken client credential grant should 400 and return error when client secret is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "client_credentials";
        req.body.client_id = "client_id";

        let response = {
            success: false,
            message: "client_secret parameter is required when grant_type is client_credentials"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken client_credential grant should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        req.body.grant_type = "client_credentials";
        req.body.client_id = "client_id";
        req.body.client_secret = "client_secret";

        let response = {
            "access_token": "JALKjlzlkJLOI23enlLZJLCKnLKASd",
            "id_token": "KLAskd0aoskaojk3LKAJLkmxPIAS",
            "refresh_token": "eJYdAskd2dfskadjkeLKWwrQmxPIaKL",
            "token_type": "Bearer",
            "expires_in": 3600
        }
        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    /*---- refresh_token grants ----*/
    test('getToken refresh_token grant should 400 and return error when token is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.grant_type = "refresh_token";

        let response = {
            success: false,
            message: "refresh_token parameter is required when grant_type is refresh_token"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken refresh token grant should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.grant_type = "refresh_token";
        req.body.refresh_token = "refresh_token";

        let response = {
            "access_token": "JALKjlzlkJLOI23enlLZJLCKnLKASd",
            "id_token": "KLAskd0aoskaojk3LKAJLkmxPIAS",
            "refresh_token": "eJYdAskd2dfskadjkeLKWwrQmxPIaKL",
            "token_type": "Bearer",
            "expires_in": 3600
        }

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    /*---- oauth server error ----*/
    test('getToken OAUTH Server should 400 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.grant_type = "refresh_token";
        req.body.refresh_token = "refresh_token";

        let response = {
            status: 401,
            error_description: "not authorized",
        }

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).reply(401, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith({success: false, message: "Couldn't obtain a set of tokens. OAuth server returned error: not authorized."});
    });

    test('getToken OAUTH Server should timeout', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.grant_type = "refresh_token";
        req.body.refresh_token = "refresh_token";

        let response = {
            success: false,
            message: "Couldn't obtain a set of tokens. OAuth server returned error: timeout of 0ms exceeded."
        }

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('getToken OAUTH Server should network error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.grant_type = "refresh_token";
        req.body.refresh_token = "refresh_token";

        let response = {
            success: false,
            message: "Couldn't obtain a set of tokens. OAuth server returned error: Network Error."
        }

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.TOKEN_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.getToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    /*---- revoke token ----*/
    test('revokeToken should 400 and return error when body is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body = null;

        let response = {
            success: false,
            message: "request body is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('revokeToken should 400 and return error when token is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.refresh_token == null

        let response = {
            success: false,
            message: "refresh_token parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('revokeToken should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.refresh_token = "refresh_token";

        let response = "OK";

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.REVOKE_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('revokeToken should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.refresh_token = "refresh_token";

        let response = {
            success: false,
            message: "Couldn't revoke access tokens. OAuth server returned error: %s."
        };

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.REVOKE_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('revokeToken should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.refresh_token = "refresh_token";

        let response = {
            success: false,
            message: "Couldn't revoke access tokens. OAuth server returned error: timeout of 0ms exceeded."
        };

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.REVOKE_ENDPOINT).timeout();

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('revokeToken should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.refresh_token = "refresh_token";

        let response = {
            success: false,
            message: "Couldn't revoke access tokens. OAuth server returned error: Network Error."
        };

        mock.onPost((process.env.OAUTH_SERVER as string) + process.env.REVOKE_ENDPOINT).networkError();

        let controller: AuthenticationController = new AuthenticationController();
        await controller.revokeToken(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    /*---- forgot password ----*/
    test('forgotPassword should 400 and return error when body is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body = null;

        let response = {
            success: false,
            message: "request body is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('forgotPassword should 400 and return error when username is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.username == null

        let response = {
            success: false,
            message: "username parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('forgotPassword should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }
        let response = {
            "displayName": "John Doe",
            "active": true,
            "emails": [
                {
                    "value": "johndoe@example.com",
                    "primary": true
                }
            ],
            "meta": {
                "created": "2019-05-29T12:45:30.671Z",
                "lastModified": "2019-05-29T12:45:30.671Z",
                "resourceType": "User"
            },
            "schemas": [
                "urn:ietf:params:scim:schemas:core:2.0:User"
            ],
            "name": {
                "givenName": "John",
                "familyName": "Doe",
                "formatted": "John Doe"
            },
            "id": "66ad3522-2251-4531-abff-3e3aad66b650"
        }

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('forgotPassword should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Forgot Password workflow. OAuth server returned error: %s."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('forgotPassword should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Forgot Password workflow. OAuth server returned error: timeout of 0ms exceeded.",
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('forgotPassword should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Forgot Password workflow. OAuth server returned error: Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('forgotPassword iamServer should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Forgot Password workflow. Request failed with status code 500."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('forgotPassword iamServer should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Forgot Password workflow. timeout of 0ms exceeded."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('forgotPassword iamServer should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.username = "username";

        let response = {
            success: false,
            message:  "Unknown error while trying to initiate Forgot Password workflow. Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.forgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    /*---- confirm forgot password ----*/
    test('confirmForgotPassword should 400 and return error when body is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body = null;

        let response = {
            success: false,
            message: "request body is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('confirmForgotPassword should 400 and return error when context is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.context == null

        let response = {
            success: false,
            message: "context parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('confirmForgotPassword should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }
        let response = {
            "success": true,
            "uuid": "773f85b4-72f4-480d-aca8-755f517c4508"
        }

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_CONFIRM_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('confirmForgotPassword should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Confirm Password Reset workflow. OAuth server returned error: %s."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_CONFIRM_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('confirmForgotPassword should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Confirm Password Reset workflow. OAuth server returned error: timeout of 0ms exceeded."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_CONFIRM_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('confirmForgotPassword should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Confirm Password Reset workflow. OAuth server returned error: Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.FORGOT_PASSWORD_CONFIRM_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('confirmForgotPassword iamServer should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Confirm Password Reset workflow. Request failed with status code 500."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('confirmForgotPassword iamServer should tineout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Confirm Password Reset workflow. timeout of 0ms exceeded."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('confirmForgotPassword iamServer should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.context = "context";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Confirm Password Reset workflow. Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.confirmForgotPassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    /*---- confirm forgot password ----*/
    test('changePassword should 400 and return error when body is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body = null;

        let response = {
            success: false,
            message: "request body is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword should 400 and return error when uuid is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.uuid == null

        let response = {
            success: false,
            message: "uuid parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword should 400 and return error when password is missing', async () => {
        let req = mockRequest();
        const res = mockResponse();

        req.body.uuid = "uuid";
        req.body.password = null;

        let response = {
            success: false,
            message: "password parameter is missing"
        }

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword should 200 and return correct value', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }
        let response = {
            "success": true,
            "uuid": "773f85b4-72f4-480d-aca8-755f517c4508"
        }

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.CHANGE_PASSWORD_ENDPOINT).reply(200, response)

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Change Password workflow. OAuth server returned error: %s."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.CHANGE_PASSWORD_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('changePassword should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Change Password workflow. OAuth server returned error: timeout of 0ms exceeded."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.CHANGE_PASSWORD_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('changePassword should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let iamResponse = {
            access_token: "wqerqwerqwerwerwqer"
        }

        let response = {
            success: false,
            message: "Couldn't initiate Change Password workflow. OAuth server returned error: Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(200, iamResponse)
        mock.onPost((process.env.MANAGEMENT_SERVER as string) + process.env.CHANGE_PASSWORD_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword iamServer should 500 and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Change Password workflow. Request failed with status code 500."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).reply(500, "Some Internal Error")

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });

    test('changePassword iamServer should timeout and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let response = {
            success: false,
            message:  "Unknown error while trying to initiate Change Password workflow. timeout of 0ms exceeded."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).timeout()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });


    test('changePassword iamServer should network error and return error', async () => {
        let req = mockRequest();
        const res = mockResponse();
        let mock = new MockAdapter(axios);

        req.body.uuid = "uuid";
        req.body.password = "password";

        let response = {
            success: false,
            message: "Unknown error while trying to initiate Change Password workflow. Network Error."
        };

        mock.onPost((process.env.IAM_SERVER as string) + process.env.IAM_TOKEN_ENDPOINT).networkError()

        let controller: AuthenticationController = new AuthenticationController();
        await controller.changePassword(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
    });
});

