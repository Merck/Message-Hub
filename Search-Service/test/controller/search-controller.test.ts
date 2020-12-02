/*
 * EPCIS MESSAGING HUB - SEARCH SERVICE

 */

const {Client} = require('@elastic/elasticsearch');
import {SearchController} from '../../src/controller/search-controller';

//mock Elasticsearch
jest.mock('@elastic/elasticsearch', () => {
    const mClient = {
        connect: jest.fn(),
        indices: {
            exists: jest.fn(),
            create: jest.fn(),
            putMapping: jest.fn(),
            getMapping: jest.fn(),
            refresh: jest.fn(),
            delete: jest.fn()
        },
        index: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        search: jest.fn()
    };
    return {Client: jest.fn(() => mClient)};
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'SearchController\' ", () => {

    let client: any;
    let controller: SearchController;

    beforeAll(() => {
        jest.resetModules();
        process.env = {
            ESCERT: ""
        };
        client = new Client();
        client.indices.exists.mockReturnValue({body: true});
        controller = new SearchController();
    });

    /** executeSearch **/

    test('executeSearch should 400 when no org ID is provided', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.executeSearch(req, res);

        const response = {success: false, message: "orgId path parameter is required"};
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('executeSearch should 200 when valid data is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.pagenumber = 1;
        req.query.resultsperpage = 25;
        req.query.text="urn:epc:id:sgln:0614141.12345.32a%2Fb";
        req.query.startdate="01/01/2020";
        req.query.enddate="01/01/2020";
        req.query.type="object";
        req.query.action="add";
        req.query.source="some source";
        req.query.destination="some destination";
        req.query.status="accepted";
        req.query.sort=JSON.stringify([
            {timestamp: {order: "desc"}},
            {action: {order: "desc"}},
            {type: {order: "desc"}},
            {source: {order: "desc"}},
            {destination: {order: "desc"}},
            {status: {order: "desc"}}
            ]);

        const res = mockResponse();

        let searchResults = {
            body:{
                hits:{
                    total: 0,
                    hits:[]
                }
            }
        }

        client.search.mockResolvedValue(searchResults);

        await controller.executeSearch(req, res);

        const response = {
            currentPage: 1,
            results: [],
            resultsPerPage: 25,
            sort:  [
                {timestamp: {order: "desc"}},
                {"action.keyword": {order: "desc"}},
                {"type.keyword": {order: "desc"}},
                {"source.keyword": {order: "desc"}},
                {"destination.keyword": {order: "desc"}},
                {"status.keyword": {order: "desc"}}],
            totalPages: 0,
            totalResults: 0
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('executeSearch should 200 and default sort when valid data is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.pagenumber = 1;
        req.query.resultsperpage = 25;
        req.query.text=["urn:epc:id:sgln:0614141.12345.32a%2Fb", "urn:epc:id:sgln:0614141.12345.6545"];

        const res = mockResponse();

        let searchResults = {
            body: {
                hits:{
                    total: 0,
                    hits:[]
                }
            }
        }

        client.search.mockResolvedValue(searchResults);

        await controller.executeSearch(req, res);

        const response = {
            currentPage: 1,
            results: [],
            resultsPerPage: 25,
            sort:  [
                {timestamp: {order: "desc"}}],
            totalPages: 0,
            totalResults: 0
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('executeSearch should 500 and when elasticsearch fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.query.pagenumber = 1;
        req.query.resultsperpage = 25;
        req.query.text="dummy";

        const res = mockResponse();

        let searchResults = {
            hits:{
                total: 0,
                hits:[]
            }
        }

        client.search.mockRejectedValue(new Error("Elasticsearch error"));

        await controller.executeSearch(req, res);

        const response = {
            success: false,
            message: "Couldn't query event data in Elasticsearch"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** addEventToSearchIndex **/

    test('addEventToSearchIndex should 400 if org ID is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.addEventToSearchIndex(req, res);

        const response = {
            success: false,
            message: "orgId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('addEventToSearchIndex should 400 if request body is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        await controller.addEventToSearchIndex(req, res);

        const response = {
            success: false,
            message: "No event data in request body"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('addEventToSearchIndex should 200 if valid data is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body={
            id: "123123-123123-123-1231231",
            type: "object",
            action: "add"
        }
        const res = mockResponse();

        await controller.addEventToSearchIndex(req, res);

        const response = {
            success: true,
            message: "Event added to search index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('addEventToSearchIndex should 500 if elastic search fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.body={
            id: "123123-123123-123-1231231",
            type: "object",
            action: "add"
        }
        const res = mockResponse();

        client.index.mockRejectedValue(new Error("Elasticsearch error"));

        await controller.addEventToSearchIndex(req, res);

        const response = {
            success: false,
            message: "Couldn't index new event data in Elasticsearch"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getEventBasedOnID **/

    test('getEventBasedOnID should 400 if org ID is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.getEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "orgId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventBasedOnID should 400 if event id is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        await controller.getEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "eventId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventBasedOnID should 200 if data is valid', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        const res = mockResponse();

        const response = {
            id: "123123-123123-123-1231231",
            type: "object",
            action: "add"
        };

        client.get.mockResolvedValue({body:{_source: response}});
        await controller.getEventBasedOnID(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventBasedOnID should 500 if elasticsearch fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        const res = mockResponse();

        client.get.mockRejectedValue(new Error( "Elasticsearch error"));
        await controller.getEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "Couldn't retrieve event data by ID from Elasticsearch"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    /** updateEventBasedOnID **/

    test('updateEventBasedOnID should 400 if org ID is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "orgId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateEventBasedOnID should 400 if event ID is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "eventId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateEventBasedOnID should 400 if request body is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "eventId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('updateEventBasedOnID should 200 if valid data is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        req.body={
            id: "123123-123123-123-1231231",
            type: "object",
            action: "add"
        }
        const res = mockResponse();

        client.update.mockResolvedValue({});
        client.indices.refresh.mockResolvedValue({});
        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: true,
            message: "Record is updated into Elastic search index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateEventBasedOnID should 200 if destination is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        req.body={
            id: "123123-123123-123-1231231",
            status: "on_ledger",
            destination: "mock-adapter2"
        }
        const res = mockResponse();
        const getResponse = {
            "organization": 1,
            "id": "123123-123123-123-1231231",
            "textids": [
                [
                    "urn:epc:id:sgtin:0.0.0",
                    "urn:epc:id:sgtin:0.0.1"
                ]
            ],
            "timestamp": "2020-10-03T10:28:08.717Z",
            "type": "object",
            "action": "add",
            "source": "mock source",
            "status": "on_ledger",
            "destination": "mock adapter"
        };
        client.get.mockResolvedValue({body:{_source: getResponse}});
        client.update.mockResolvedValue({});
        client.indices.refresh.mockResolvedValue({});
        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: true,
            message: "Record is updated into Elastic search index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateEventBasedOnID should 200  when a previous destination present and another being added', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        req.body={
            id: "123123-123123-123-1231231",
            status: "on_ledger",
            destination: "mock-adapter2"
        }
        const res = mockResponse();
        const getResponse = {
            "organization": 1,
            "id": "123123-123123-123-1231231",
            "textids": [
                [
                    "urn:epc:id:sgtin:0.0.0",
                    "urn:epc:id:sgtin:0.0.1"
                ]
            ],
            "timestamp": "2020-10-03T10:28:08.717Z",
            "type": "object",
            "action": "add",
            "source": "mock source",
            "status": "on_ledger",
            "destination": ["mock adapter"]
        };
        client.get.mockResolvedValue({body:{_source: getResponse}});
        client.update.mockResolvedValue({});
        client.indices.refresh.mockResolvedValue({});
        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: true,
            message: "Record is updated into Elastic search index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateEventBasedOnID should 200 if destination is provided and the previous status is not on ledger', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";
        req.body={
            id: "123123-123123-123-1231231",
            status: "on_ledger",
            destination: "mock-adapter2"
        }
        const res = mockResponse();
        const getResponse = {
            "organization": 1,
            "id": "123123-123123-123-1231231",
            "textids": [
                [
                    "urn:epc:id:sgtin:0.0.0",
                    "urn:epc:id:sgtin:0.0.1"
                ]
            ],
            "timestamp": "2020-10-03T10:28:08.717Z",
            "type": "object",
            "action": "add",
            "source": "mock source",
            "status": "failed",
            "destination": "No route found"
        };
        client.get.mockResolvedValue({body:{_source: getResponse}});
        client.update.mockResolvedValue({});
        client.indices.refresh.mockResolvedValue({});
        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: true,
            message: "Record is updated into Elastic search index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateEventBasedOnID should 500 if elastic search fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";

        req.body={
            id: "123123-123123-123-1231231",
            type: "object",
            action: "add"
        }
        const res = mockResponse();

        client.update.mockRejectedValue(new Error("Elasticsearch error"));
        client.indices.refresh.mockResolvedValue({});
        await controller.updateEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "Couldn't update event data in Elasticsearch"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** deleteEventBasedOnID **/

    test('deleteEventBasedOnID should 400 if org ID is missing', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await controller.deleteEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "orgId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteEventBasedOnID should 400 if event ID is missing', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const res = mockResponse();

        await controller.deleteEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "eventId path parameter is required"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteEventBasedOnID should 200 if valid data is provided', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";

        const res = mockResponse();

        client.delete.mockResolvedValue({});
        client.indices.refresh.mockResolvedValue({});
        await controller.deleteEventBasedOnID(req, res);

        const response = {
            success: true,
            message: "Record deleted in Elasticsearch index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteEventBasedOnID should 500 if elastic search fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "123123-123123-123-1231231";

        const res = mockResponse();

        client.delete.mockRejectedValue(new Error("Elasticsearch error"));
        client.indices.refresh.mockResolvedValue({});
        await controller.deleteEventBasedOnID(req, res);

        const response = {
            success: false,
            message: "Couldn't delete event data in Elasticsearch"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /** deleteIndexFromElasticSearchDB **/

    test('deleteIndexFromElasticSearchDB should 200 if elastic search succeeds', async () => {
        const req = mockRequest();
        const res = mockResponse();

        client.indices.delete.mockResolvedValue({});

        await controller.deleteIndexFromElasticSearchDB(req, res);

        const response = {
            success: true,
            message: "Deleted Elasticsearch index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteIndexFromElasticSearchDB should 500 if elastic search fails', async () => {
        const req = mockRequest();
        const res = mockResponse();

        client.indices.delete.mockRejectedValue(new Error("Elasticsearch error"));

        await controller.deleteIndexFromElasticSearchDB(req, res);

        const response = {
            success: false,
            message: "Couldn't delete Elasticsearch index"
        };
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});