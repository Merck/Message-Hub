/*
 * EPCIS MESSAGING HUB - EVENT BFF

 */

import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import {EventController} from "../../src/controller/event-controller";

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk4NTUyMjEyLCJhdWQiOlsiM2U4YWQxMDItZWNkOC00NjdmLWE5ZDAtNmZhY2Q3NzM0YmM4Il0sInN1YiI6IjNlOGFkMTAyLWVjZDgtNDY3Zi1hOWQwLTZmYWNkNzczNGJjOCIsImFtciI6WyJhcHBpZF9jbGllbnRfY3JlZGVudGlhbHMiXSwiaWF0IjoxNTk4NTQ4NjEyLCJ0ZW5hbnQiOiI3ZTRmMTZjZC1hNWI4LTQ1YTItOWQ2NS00MDk2YTQ4OGU5ZWUiLCJzY29wZSI6ImFwcGlkX2RlZmF1bHQifQ.CwI0xcfuiyYGncaOnQ_acxm3QboYTILnCtNIbep2raOiJz2Vx91RcN8PzkW6vS6WAfbzIeIwHedsxtjXT-IR0qJ4Ua0cd69ON_k_XJU3aMJW4efQGcKmHNbm6SY2rUzxpIcFs_3ot90o4C3nXJg1dGWrTQZXqbvGsOl54i7v0rG2xJhvGsK40rPy4g6BK1aCkJHjt4rfh647Z5XdRFmumQ79JcnFOZslPy4KDCndsxi6iXPQb9d3sOgI7fJ4nw-IHPymZgpegB752holjR0cdgLvCm6QidjNqfDdfYvXxGe2EdhajgMllL_nl33dcxhjYllwjBpdlefIIzjgCM_hLA";

describe("Check \'EventController\' ", () => {

    let controller: EventController;

    beforeAll(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if (!process.env.EVENT_SERVICE) {
            process.env = {
                EVENT_SERVICE: "http://somehost:9000"
            }
        }
        controller = new EventController();
    });

    /** postEvent **/
    
    test('postEvent 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            "success": true,
            "message": "Accepted",
            "callback": "https://169.60.27.106/masterdata/ceff5359-373e-4c1f-8f33-bd9d7b8798fc/status"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events"
        const url = new RegExp(`${eventUri}\\S+${eventPath}`);

        mock.onPost(url).reply(200, eventresponse);

        await controller.postEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('postEvent should 400 Response when bad XML is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Bad XML"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events"
        const url = new RegExp(`${eventUri}\\S+${eventPath}`);

        mock.onPost(url).reply(400, eventresponse);

        await controller.postEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('postEvent should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const eventresponse = {
            success: false,
            message:  "Error getting client id from request token. No authorization header received"
        }

        await controller.postEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('postEvent should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Error posting event to event-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. Network Error"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events"
        const url = new RegExp(`${eventUri}\\S+${eventPath}`);

        mock.onPost(url).networkError();

        await controller.postEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('postEvent should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message:  "Error posting event to event-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. timeout of 0ms exceeded"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events"
        const url = new RegExp(`${eventUri}\\S+${eventPath}`);

        mock.onPost(url).timeout();

        await controller.postEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    
    /** getEvent **/
    
    test('GetEvent 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            type: "object",
            action: "add",
            source: "System 1 for Org 1",
            status: "accepted"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+`);

        mock.onGet(url).reply(200, eventresponse);

        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEvent should 404 Response when bad id is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Event not found"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+`);

        mock.onGet(url).reply(404, eventresponse);

        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('getEvent should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const eventresponse = {
            success: false,
            message:  "Error getting client id from request token. No authorization header received"
        }

        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEvent should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Error getting event from event-service for event id 0f49befb-84e2-45ef-b9ca-dc545787d960. Network Error"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+`);

        mock.onGet(url).networkError();

        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('GetEvent should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message:  "Error getting event from event-service for event id 0f49befb-84e2-45ef-b9ca-dc545787d960. timeout of 0ms exceeded"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+`);

        mock.onGet(url).timeout();

        await controller.getEvent(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    
    
    /**  getEventStatus **/

    test('getEventStatus 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            "id": "752b1d09-e607-467b-8beb-ab36d1f37c15",
            "status": "on_ledger",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-27T17:24:19.175Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-27T17:24:19.493Z",
                    "blockchain_response": "Got it thanks"
                }
            ]
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const statusPath = "/status"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+${statusPath}`);

        mock.onGet(url).reply(200, eventresponse);

        await controller.getEventStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('getEventStatus should 404 Response when bad id is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Event not found"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const statusPath = "/status"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+${statusPath}`);


        mock.onGet(url).reply(404, eventresponse);

        await controller.getEventStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('getEventStatus should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const eventresponse = {
            success: false,
            message:  "Error getting client id from request token. No authorization header received"
        }

        await controller.getEventStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('getEventStatus should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Error getting event status from event-service for event id 0f49befb-84e2-45ef-b9ca-dc545787d960. Network Error"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const statusPath = "/status"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+${statusPath}`);


        mock.onGet(url).networkError();

        await controller.getEventStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });

    test('getEventStatus should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventresponse = {
            success: false,
            message: "Error getting event status from event-service for event id 0f49befb-84e2-45ef-b9ca-dc545787d960. timeout of 0ms exceeded"
        }

        const eventUri = process.env.EVENT_SERVICE + "/client/"
        const eventPath = "/events/"
        const statusPath = "/status"
        const url = new RegExp(`${eventUri}\\S+${eventPath}\\S+${statusPath}`);


        mock.onGet(url).timeout();

        await controller.getEventStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(eventresponse);
    });
    

});