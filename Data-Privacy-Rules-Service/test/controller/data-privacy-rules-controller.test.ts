/*
 * EPCIS MESSAGING HUB - DataPrivacy RULES SERVICE
 
 */

import {Pool} from "pg";
import {DataPrivacyRulesController} from '../../src/controller/data-privacy-rules-controller';
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


describe("Check class \'DataPrivacyRulesController\' ", () => {

    let pool: any;
    let controller: DataPrivacyRulesController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            PGCERT: ""
        };
        pool = new Pool();
        controller = new DataPrivacyRulesController();
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
            message: "no data privacy rules data fields found"
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
    
    /** getAllDataPrivacyRulesForOrganization **/

    test('getAllDataPrivacyRulesForOrganization should 200 when data is available', async () => {
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
        await controller.getAllDataPrivacyRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAllDataPrivacyRulesForOrganization should 200 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response:any = []

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getAllDataPrivacyRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAllDataPrivacyRulesForOrganization should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve data privacy rules from database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getAllDataPrivacyRulesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** createDataPrivacyRule **/

    test('createDataPrivacyRule should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            can_store: true,
            order: 1
        }
        const res = mockResponse();
        const response = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2,
            "datafield_type": "masterdata",
            "datafield_display": "Read Point",
            "datafield_path": "urn:epcglobal:epcis:vtype:ReadPoint"
        };


        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('createDataPrivacyRule should 400 when can_store is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing can_store in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createDataPrivacyRule should 400 when order is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            can_store: true
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing order in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createDataPrivacyRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            data_field: 1,
            can_store: true,
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createDataPrivacyRule should 400 when data_field is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com",
            can_store: true,
            order: 1
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing data_field in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createDataPrivacyRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            editor: "someone@somewhere.com",
            data_field: 1,
            can_store: true,
            order: 1
        }

        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't create the data privacy rule in database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.createDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getDataPrivacyRule **/

    test('getDataPrivacyRule should 200 when data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2,
            "datafield_type": "masterdata",
            "datafield_display": "Read Point",
            "datafield_path": "urn:epcglobal:epcis:vtype:ReadPoint"
        };

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDataPrivacyRule should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no rule found with that id"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getDataPrivacyRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve data privacy rule from database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** updateDataPrivacyRule **/

    test('updateDataPrivacyRule should 200 when data is available', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2,
            "editor": "someone@someplace.com"
        }
        const res = mockResponse();
        const response = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2,
            "datafield_type": "masterdata",
            "datafield_display": "Read Point",
            "datafield_path": "urn:epcglobal:epcis:vtype:ReadPoint"
        };;

        pool.query.mockResolvedValue({rows: [response], rowCount: 1});
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateDataPrivacyRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateDataPrivacyRule should 400 when data_field is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            "id": 5,
            "organization_id": 3,
            "can_store": 3,
            "order": 2,
            "editor": "someone@someplace.com"
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing data_field in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateDataPrivacyRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.body = {
            "id": 5,
            "organization_id": 3,
            "data_field": 3,
            "can_store": 3,
            "order": 2,
            "editor": "someone@someplace.com"
        }

        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't update the data privacy rule in database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.updateDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** updateDataPrivacyRulesOrdering **/

    test('updateDataPrivacyRulesOrdering should 200 when data is available', async () => {
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
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateDataPrivacyRulesOrdering should 400 when rules list is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 3;
        req.body = {
            editor: "someone@somewhere.com"
        }
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing rulesordered in request or is not an array",
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateDataPrivacyRulesOrdering should 400 when editor is missing', async () => {
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
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateDataPrivacyRulesOrdering should 500 when db error occurs', async () => {
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
            message: "Couldn't update the ordering of data privacy rules in database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.updateDataPrivacyRulesOrdering(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** deleteDataPrivacyRule **/

    test('deleteDataPrivacyRule should 200 when data is available', async () => {
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
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteDataPrivacyRule should 400 when editor is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        const res = mockResponse();
        const response = {
            success: false,
            message: "Missing editor in request"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteDataPrivacyRule should 500 when bad id is passed', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        req.body.editor = "someone@somewhere.com"
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't delete the data privacy rule in database."
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('deleteDataPrivacyRule should 500 when db error occurs', async () => {
        const req = mockRequest();
        req.params.orgId = 0;
        req.params.ruleId = 0;
        req.body.editor = "someone@somewhere.com"
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't delete the data privacy rule in database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.deleteDataPrivacyRule(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** getDataPrivacyRulesHistory **/

    test('getDataPrivacyRulesHistory should 200 when data is available', async () => {
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
        await controller.getDataPrivacyRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDataPrivacyRulesHistory should 404 when no data is available', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "no audit history found"
        }

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        await controller.getDataPrivacyRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getDataPrivacyRulesHistory should 500 when db error occurs', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const response = {
            success: false,
            message: "Couldn't retrieve data privacy rules audit history from database."
        }
        req.params.orgId = 1;
        let mock = new MockAdapter(axios);
        pool.query.mockRejectedValue(new Error("Bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        await controller.getDataPrivacyRulesHistory(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
