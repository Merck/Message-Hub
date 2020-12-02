/*
 * EPCIS MESSAGING HUB - ROUTING RULES SERVICE

 */

import {Pool} from "pg";
import {RoutingRulesController} from '../../src/controller/routing-rules-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return {Pool: jest.fn(() => mPool)};
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'RoutingRulesController\' ", () => {

    let pool: any;
    let controller: RoutingRulesController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            PGCERT: ""
        };
        pool = new Pool();
        controller = new RoutingRulesController();
    });


    /** getDataFields **/
    
    test('getDataFields should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = [
            {
                "id": 5,
                "path": "$.epcisbody.eventlist.aggregationevent.childepcs.epc",
                "display_name": "Aggregation Event: STGIN",
                "value_prefix": "urn:epc:id:sgtin:",
                "data_type": "AGGREGATION"
            }
        ]

        pool.query.mockResolvedValue({rows: response, rowCount: response.length});
        await controller.getDataFields(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDataFields should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no routing rules data fields found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getDataFields(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getDataFields should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve the list of configured data fields from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getDataFields(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getComparators **/

    test('getComparators should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = [
            {
                "id": 5,
                "service_name": "mock-adapter",
                "display_name": "Mock Adapter",
                "active": true
            }
        ]

        pool.query.mockResolvedValue({rows: response, rowCount: response.length});
        await controller.getComparators(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getComparators should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no routing rules comparators found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getComparators(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getComparators should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve the list of configured comparators from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getComparators(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getAdapters **/

    test('getAdapters should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = [
            {
                "id": 5,
                "service_name": "mock-adapter",
                "display_name": "Mock Adapter",
                "active": true
            }
        ]

        pool.query.mockResolvedValue({rows: response, rowCount: response.length});
        await controller.getAdapters(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAdapters should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no routing rules destinations found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getAdapters(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getAdapters should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve the list of configured adapters from database."
        }

        pool.query.mockRejectedValue(new Error("Bad query"));
        await controller.getAdapters(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getAllRoutingRulesForOrganization **/

    test('getAllRoutingRulesForOrganization should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = [
            {
                "id": 74,
                "organization_id": 3,
                "data_field": 1,
                "datafield_type": "OBJECT",
                "datafield_display": "Object Event: SGTIN",
                "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "8888555.600301.*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ]

        pool.query.mockResolvedValue({rows: response, rowCount: response.length});
        await controller.getAllRoutingRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAllRoutingRulesForOrganization should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no routing rules found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getAllRoutingRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getAllRoutingRulesForOrganization should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve routing rules from database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getAllRoutingRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** createRoutingRule **/

    test('createRoutingRule should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response =
            {
                "id": 74,
                "organization_id": 3,
                "data_field": 1,
                "datafield_type": "OBJECT",
                "datafield_display": "Object Event: SGTIN",
                "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "8888555.600301.*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            };


        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('createRoutingRule should 400 when comparator is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing comparator in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 400 when value is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing or empty value in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 400 when destination is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing or empty destinations in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 400 when order is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"]
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing order in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 400 when data_field is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing data_field in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createRoutingRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 2,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }

        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't create the routing rule in database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.createRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getRoutingRule **/

    test('getRoutingRule should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = 
            {
                "id": 74,
                "organization_id": 3,
                "data_field": 1,
                "datafield_type": "OBJECT",
                "datafield_display": "Object Event: SGTIN",
                "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "8888555.600301.*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            };
        

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getRoutingRule should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no rule found with that id"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getRoutingRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve routing rule from database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** updateRoutingRule **/

    test('updateRoutingRule should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response =
            {
                "id": 74,
                "organization_id": 3,
                "data_field": 1,
                "datafield_type": "OBJECT",
                "datafield_display": "Object Event: SGTIN",
                "datafield_path": "$.epcisbody.eventlist.objectevent.epclist.epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "8888555.600301.*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            };


        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateRoutingRule should 400 when comparator is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing comparator in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 400 when value is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing or empty value in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 400 when destination is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing or empty destinations in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 400 when order is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"]
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing order in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            data_field: 1,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 400 when data_field is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing data_field in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 2,
            comparator: 3,
            value: "8888555.600301.*",
            destinations: ["mock-adapter"],
            order: 1
        }

        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't update the routing rule in database."
        }

        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.updateRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** updateRoutingRulesOrdering **/

    test('updateRoutingRulesOrdering should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            "rulesordered": [
                74,
                77,
                75
            ],
            "editor": "someone@hub.com"
        }
        const res = mockResponse();
        const response = {
            "success": true,
            "message": "rules reordered"
        };


        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateRoutingRulesOrdering should 400 when rules list is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com"
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing rulesordered in request",
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRulesOrdering should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            "rulesordered": [
                74,
                77,
                75
            ]
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request",
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateRoutingRulesOrdering should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            "rulesordered": [
                74,
                77,
                75
            ],
            "editor": "someone@hub.com"
        }

        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't update the ordering the list of routing rules in database."
        }

        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.updateRoutingRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** deleteRoutingRule **/

    test('deleteRoutingRule should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        req.body.editor = "someone@somewhere.com"

        const res = mockResponse();
        const dbresponse = {
            id: 0,
            organization_id: 0,
            data_field: 1,
            comparator: 1,
            value: "*"
        };
        const dbhistoryresponse = {
            id: 0,
            organization_id: 0,
            data_field: 1,
            comparator: 1,
            value: "*",
            status: "DELETED"
        };
        const response = {
            success: true,
            message: "rule deleted"
        }

        pool.query.mockResolvedValueOnce({rows: [dbresponse], rowCount: 1})
            .mockResolvedValueOnce({rows: [dbhistoryresponse], rowCount: 1});
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteRoutingRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteRoutingRule should 500 when bad id is passed', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        req.body.editor = "someone@somewhere.com"
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't delete the routing rule from database."
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('deleteRoutingRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        req.body.editor = "someone@somewhere.com"
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't delete the routing rule from database."
        }

        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.deleteRoutingRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getRoutingRulesHistory **/

    test('getRoutingRulesHistory should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response =[
            {
                "rules_id": 77,
                "change_description": "CREATED",
                "editor": "someone@hub.com",
                "timestamp": "2020-08-14T16:15:54.968Z",
                "datafield_type": "OBJECT",
                "new_datafield_display": "Object Event: SGTIN",
                "new_comparator_display": "is like (wildcard *)",
                "new_value": "*",
                "new_destinations": [
                    "mock-adapter",
                    "mock-adapter-two"
                ],
                "new_order": 3
            }
        ]


        pool.query.mockResolvedValue({rows: response, rowCount: response.length});
        await controller.getRoutingRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getRoutingRulesHistory should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no audit history found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getRoutingRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getRoutingRulesHistory should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve the audit history of routing rules from database."
        }

        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getRoutingRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
