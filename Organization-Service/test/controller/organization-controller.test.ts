/*
 * EPCIS MESSAGING HUB - ORGANIZATION SERVICE

 */

import {Pool} from "pg";
import {OrganizationController} from '../../src/controller/organization-controller';

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return {Pool: jest.fn(() => mPool)};
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'OrganizationController\' ", () => {

    let pool: any;
    let controller: OrganizationController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            PGCERT: ""
        };
        pool = new Pool();
        controller = new OrganizationController();
    });

    /** FindOrganization **/

    test('findOrganization should 400 when no user is identified', async () => {

        const req = mockRequest();
        const res = mockResponse();
        const response = {
            "success": false,
            "message": "either username, subjectid or clientid parameter is required"
        }
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    /*---- find user by username ---*/
    test('findOrganization should 404 when no user is in database', async () => {
        const req = mockRequest();
        req.query.username = "test";

        const res = mockResponse();
        const response = {
            "success": false,
            "message": "no organization found for username"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('findOrganization should 500 when user has db error', async () => {
        const req = mockRequest();
        req.query.username = "error@example.com";
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't find organization for username error@example.com in the database"
        }
        pool.query.mockRejectedValueOnce(new Error("Bad query"));
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('findOrganization should 200 when user is in database', async () => {
        const req = mockRequest();
        req.query.username = "john.smith@example.com";

        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('findOrganization should 200 when user is an array', async () => {
        const req = mockRequest();
        req.query.username = ["john.smith@example.com"];

        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });


    /*---- find user by client id ---*/
    test('findOrganization should 404 when no client id is in database', async () => {
        const req = mockRequest();
        req.query.clientid = "00000025-8f9c-45ac-a751-0ca0a29da5e9";

        const res = mockResponse();
        const response = {
            "success": false,
            "message": "no organization found for client id"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('findOrganization should 500 when client id has db error', async () => {
        const req = mockRequest();
        req.query.clientid = "00000025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't find organization for client id 00000025-8f9c-45ac-a751-0ca0a29da5e9 in the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('findOrganization should 200 when client id is in database', async () => {
        const req = mockRequest();
        req.query.clientid = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";

        const res = mockResponse();
        const response = {
            "source_name": "Source 1",
            "organization_id": 1,
            "client_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }
        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('findOrganization should 200 when client id is an array', async () => {
        const req = mockRequest();
        req.query.clientid = ["d7e10025-8f9c-45ac-a751-0ca0a29da5e9"];

        const res = mockResponse();
        const response = {
            "source_name": "Source 1",
            "organization_id": 1,
            "client_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }
        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    /*---- find user by subject id ---*/
    test('findOrganization should 404 when no subject id is in database', async () => {
        const req = mockRequest();
        req.query.subjectid = "00000025-8f9c-45ac-a751-0ca0a29da5e9";

        const res = mockResponse();
        const response = {
            "success": false,
            "message": "no organization found for subject id"
        }
        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('findOrganization should 500 subject id has db error', async () => {
        const req = mockRequest();
        req.query.subjectid = "12345-12345-12345";
        const res = mockResponse();

        const response = {
            success: false,
            message: "Couldn't find organization for subject id 12345-12345-12345 in the database"
        }
        
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('findOrganization should 200 when subject id is in database', async () => {
        const req = mockRequest();
        req.query.subjectid = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";

        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('findOrganization should 200 when subject id is an array', async () => {
        const req = mockRequest();
        req.query.subjectid = ["d7e10025-8f9c-45ac-a751-0ca0a29da5e9"];

        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.findOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });


    /** getOrganization **/

    test('getOrganization should 400 when no orgId is passed', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganization should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganization should 404 when bad orgId is passed', async () => {
        const req = mockRequest();
        req.params.orgId = 23;
        const res = mockResponse();
        const response = {"success": false, "message": "query returned 0 rows"};

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getOrganization should 200 when known orgId is passed', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            "id": 1,
            "name": "Merck - North America"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getOrganization should 500 when has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve organization data for org id 1 from the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** CreateOrganization **/

    test('createOrganization should 400 when name is missing', async () => {
        const req = mockRequest();
        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "name is required in request body"};
        await controller.createOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganization should 200 when good values are passed', async () => {
        const req = mockRequest();
        req.body = {name: "some name"};
        const res = mockResponse();
        const response = {
            "id": 12,
            "name": "some name"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.createOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('createOrganization should 500 when client id has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {
            name: "Mock Org"
        }
        const res = mockResponse();
        const response = {
            success: false,
            message:  "Couldn't create new organization with name Mock Org in the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.createOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** UpdateOrganization **/

    test('updateOrganization should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganization should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganization should 400 when name is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "name is required in request body"};
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganization should 200 when good values are passed', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {name: "some name"};
        const res = mockResponse();
        const response = {
            "id": 12,
            "name": "some name"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateOrganization should 500 when client id has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't update organization with org id 1 in the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.updateOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** deleteOrganization **/

    test('deleteOrganizationUser should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.deleteOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteOrganization should 501 always', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            success: false,
            "message": "NOT IMPLEMENTED YET"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.deleteOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(501);
    });


    /** getOrganizationUsers **/

    test('getOrganizationUsers should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationUsers should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationUsers should 404 when org has no users', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getOrganizationUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        const response = {"success": false, "message": "query returned 0 rows"};
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getOrganizationUsers should 200 when org has users', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = [{
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }];

        pool.query.mockResolvedValue({rows: response, rowCount: 1});
        await controller.getOrganizationUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getOrganizationUsers should 500 when has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve organization users with org id 1 from the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getOrganizationUsers(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getOrganizationUser **/

    test('getOrganizationUser should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationUser should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationUser should 400 when subjectId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "subjectId path parameter is required"};
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationUser should 404 when subject id is invalid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {"success": false, "message": "query returned 0 rows"};

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getOrganizationUser should 200 when subject id is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getOrganizationUser should 500 when has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve organization user with org id 1 and subject id d7e10025-8f9c-45ac-a751-0ca0a29da5e9 from the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** createOrganizationUser **/

    test('createOrganizationUser should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationUser should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationUser should 400 when username is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "username is required in request body"};
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationUser should 400 when subjectId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {username: "test"};
        const res = mockResponse();
        const response = {"success": false, "message": "subjectid is required in request body"};
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationUser should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = "1";
        req.body = {username: "test", subjectid: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"};
        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('createOrganizationUsers should 500 when has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {username: "test", subjectid: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"};
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't create new organization user with org id 1 and subject id d7e10025-8f9c-45ac-a751-0ca0a29da5e9 in the database",
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.createOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** updateOrganizationUser **/

    test('updateOrganizationUser should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.updateOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganizationUser should 400 when subjectId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "subjectId path parameter is required"};
        await controller.updateOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganizationUser should 400 when username is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";

        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "newusername is required in request body"};
        await controller.updateOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });


    test('updateOrganizationUser should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        req.body = {newusername: "john.smith@example.com"};
        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateOrganizationUsers should 500 when has db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        req.body = {newusername: "john.smith@example.com"};
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't update organization user with org id 1 and subject id d7e10025-8f9c-45ac-a751-0ca0a29da5e9 in the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.updateOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** deleteOrganizationUser **/

    test('deleteOrganizationUser should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.deleteOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteOrganizationUser should 400 when subjectId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "subjectId path parameter is required"};
        await controller.deleteOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteOrganizationUser should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: true,
            message: "user deleted"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteOrganizationUser should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.subjectId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't delete organization user with org id 1 and subject id d7e10025-8f9c-45ac-a751-0ca0a29da5e9 from the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.deleteOrganizationUser(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getOrganizationClients **/

    test('getOrganizationClients should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationClients(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationClients should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationClients(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationClients should 404 when org has no users', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getOrganizationClients(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        const response = {"success": false, "message": "query returned 0 rows"};
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getOrganizationClients should 200 when org has users', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = [{
            "username": "john.smith@example.com",
            "organization_id": 1,
            "subject_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        }];

        pool.query.mockResolvedValue({rows: response, rowCount: 1});
        await controller.getOrganizationClients(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getOrganizationClients should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve organization clients with org id 1 from the database"
        }
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getOrganizationClients(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getOrganizationClient **/

    test('getOrganizationClient should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationClient should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationClient should 400 when clientId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "clientId path parameter is required"};
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getOrganizationClient should 404 when client id is invalid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {"success": false, "message": "query returned 0 rows"};

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getOrganizationClient should 200 when client id is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "client_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getOrganizationClient should 500 when db error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve organization client with org id 1 and client id d7e10025-8f9c-45ac-a751-0ca0a29da5e9 from the database"
        }
        
        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** createOrganizationClient **/

    test('createOrganizationClient should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.createOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationClient should 400 when orgId is not a number', async () => {
        const req = mockRequest();
        req.params.orgId = "ORG1";
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.createOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationClient should 400 when username is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "clientId is required in request body"};
        await controller.createOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationClient should 400 when clientId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body = {username: "test"};
        const res = mockResponse();
        const response = {"success": false, "message": "clientId is required in request body"};
        await controller.createOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createOrganizationClient should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = "1";
        req.body = {sourcename: "test", clientId: "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"};
        const res = mockResponse();
        const response = {
            "username": "john.smith@example.com",
            "organization_id": 1,
            "client_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.createOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });


    /** updateOrganizationClient **/

    test('updateOrganizationClient should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.updateOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganizationClient should 400 when clientId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "clientId path parameter is required"};
        await controller.updateOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateOrganizationClient should 400 when sourcename is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";

        req.body = {};
        const res = mockResponse();
        const response = {"success": false, "message": "sourcename is required in request body"};
        await controller.updateOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });


    test('updateOrganizationClient should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        req.body = {sourcename: "Some source"};
        const res = mockResponse();
        const response = {
            "source_name": "SOme source",
            "organization_id": 1,
            "client_id": "d7e10025-8f9c-45ac-a751-0ca0a29da5e9"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    /** deleteOrganizationClient **/

    test('deleteOrganizationClient should 400 when orgId is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {"success": false, "message": "orgId path parameter is required"};
        await controller.deleteOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteOrganizationClient should 400 when clientId is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();
        const response = {"success": false, "message": "clientId path parameter is required"};
        await controller.deleteOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteOrganizationClient should 200 when data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.clientId = "d7e10025-8f9c-45ac-a751-0ca0a29da5e9";
        const res = mockResponse();
        const response = {
            success: true,
            message: "client deleted"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteOrganizationClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});