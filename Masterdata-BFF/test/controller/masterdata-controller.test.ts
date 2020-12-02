/*
 * EPCIS MESSAGING HUB - EVENT BFF

 */

import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import {MasterDataController} from "../../src/controller/masterdata-controller";

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk4NTUyMjEyLCJhdWQiOlsiM2U4YWQxMDItZWNkOC00NjdmLWE5ZDAtNmZhY2Q3NzM0YmM4Il0sInN1YiI6IjNlOGFkMTAyLWVjZDgtNDY3Zi1hOWQwLTZmYWNkNzczNGJjOCIsImFtciI6WyJhcHBpZF9jbGllbnRfY3JlZGVudGlhbHMiXSwiaWF0IjoxNTk4NTQ4NjEyLCJ0ZW5hbnQiOiI3ZTRmMTZjZC1hNWI4LTQ1YTItOWQ2NS00MDk2YTQ4OGU5ZWUiLCJzY29wZSI6ImFwcGlkX2RlZmF1bHQifQ.CwI0xcfuiyYGncaOnQ_acxm3QboYTILnCtNIbep2raOiJz2Vx91RcN8PzkW6vS6WAfbzIeIwHedsxtjXT-IR0qJ4Ua0cd69ON_k_XJU3aMJW4efQGcKmHNbm6SY2rUzxpIcFs_3ot90o4C3nXJg1dGWrTQZXqbvGsOl54i7v0rG2xJhvGsK40rPy4g6BK1aCkJHjt4rfh647Z5XdRFmumQ79JcnFOZslPy4KDCndsxi6iXPQb9d3sOgI7fJ4nw-IHPymZgpegB752holjR0cdgLvCm6QidjNqfDdfYvXxGe2EdhajgMllL_nl33dcxhjYllwjBpdlefIIzjgCM_hLA";

describe("Check \'MasterDataController\' ", () => {

    let controller: MasterDataController;

    beforeAll(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if (!process.env.MASTERDATA_SERVICE) {
            process.env = {
                MASTERDATA_SERVICE: "http://somehost:9000"
            }
        }
        controller = new MasterDataController();
    });

    /** postMasterdata **/
    
    test('postMasterdata 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            "success": true,
            "message": "Accepted",
            "callback": "https://169.60.27.106/masterdata/ceff5359-373e-4c1f-8f33-bd9d7b8798fc/status"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onPost(url).reply(200, masterdataresponse);

        await controller.postMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('postMasterdata should 400 Response when bad XML is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Bad XML"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onPost(url).reply(400, masterdataresponse);

        await controller.postMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('postMasterdata should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const masterdataresponse = {
            success: false,
            message: "Error getting client id from request token. No authorization header received"
        }

        await controller.postMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('postMasterdata should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message:  "Error posting masterdata to masterdata-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. Network Error"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onPost(url).networkError();

        await controller.postMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('postMasterdata should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error posting masterdata to masterdata-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. timeout of 0ms exceeded"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onPost(url).timeout();

        await controller.postMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });


    /** getAllMasterData **/

    test('getAllMasterData 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            "success": true,
            "message": "Accepted",
            "callback": "https://169.60.27.106/masterdata/ceff5359-373e-4c1f-8f33-bd9d7b8798fc/status"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onGet(url).reply(200, masterdataresponse);

        await controller.getAllMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getAllMasterData should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const masterdataresponse = {
            success: false,
            message: "Error getting client id from request token. No authorization header received"
        }

        await controller.getAllMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getAllMasterData should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message:  "Error getting all masterdata status from masterdata-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. Network Error"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onGet(url).networkError();

        await controller.getAllMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getAllMasterData should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error getting all masterdata status from masterdata-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. timeout of 0ms exceeded"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}`);

        mock.onGet(url).timeout();

        await controller.getAllMasterData(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });
    
    /** getMasterdata **/
    
    test('GetMasterdata 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            id: "0f49befb-84e2-45ef-b9ca-dc545787d960",
            timestamp: "2020-07-26 04:10:50.46+00",
            client_id: "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            organization_id: 1,
            type: "object",
            action: "add",
            source: "System 1 for Org 1",
            status: "accepted"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onGet(url).reply(200, masterdataresponse);

        await controller.getMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterdata should 404 Response when bad id is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Masterdata not found"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onGet(url).reply(404, masterdataresponse);

        await controller.getMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getMasterdata should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const masterdataresponse = {
            success: false,
            message: "Error getting client id from request token. No authorization header received"
        }

        await controller.getMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterdata should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error getting masterdata from masterdata-service for masterdata id undefined. Network Error"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onGet(url).networkError();

        await controller.getMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('GetMasterdata should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message:  "Error getting masterdata from masterdata-service for masterdata id undefined. timeout of 0ms exceeded"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onGet(url).timeout();

        await controller.getMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });
    
    /**  getMasterdataStatus **/

    test('getMasterdataStatus 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
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

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const statusPath = "/status"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+${statusPath}`);

        mock.onGet(url).reply(200, masterdataresponse);

        await controller.getMasterdataStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getMasterdataStatus should 404 Response when bad id is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Masterdata not found"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const statusPath = "/status"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+${statusPath}`);


        mock.onGet(url).reply(404, masterdataresponse);

        await controller.getMasterdataStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getMasterdataStatus should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const masterdataresponse = {
            success: false,
            message: "Error getting client id from request token. No authorization header received"
        }

        await controller.getMasterdataStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getMasterdataStatus should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error getting masterdata status from masterdata-service for masterdata id undefined. Network Error"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const statusPath = "/status"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+${statusPath}`);


        mock.onGet(url).networkError();

        await controller.getMasterdataStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('getMasterdataStatus should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error getting masterdata status from masterdata-service for masterdata id undefined. timeout of 0ms exceeded"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const statusPath = "/status"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+${statusPath}`);


        mock.onGet(url).timeout();

        await controller.getMasterdataStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    /** deleteMasterdata **/

    test('DeleteMasterdata 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: true,
            message: "Masterdata deleted"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onDelete(url).reply(200, masterdataresponse);

        await controller.deleteMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('DeleteMasterdata should 404 Response when bad id is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Masterdata not found"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onDelete(url).reply(404, masterdataresponse);

        await controller.deleteMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('deleteMasterdata should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const masterdataresponse = {
            success: false,
            message: "Error getting client id from request token. No authorization header received"
        }

        await controller.deleteMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('DeleteMasterdata should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error deleting masterdata status from masterdata-service for masterdata id undefined. Network Error"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onDelete(url).networkError();

        await controller.deleteMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

    test('DeleteMasterdata should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataresponse = {
            success: false,
            message: "Error deleting masterdata status from masterdata-service for masterdata id undefined. timeout of 0ms exceeded"
        }

        const masterdataUri = process.env.MASTERDATA_SERVICE + "/client/"
        const masterdataPath = "/masterdata/"
        const url = new RegExp(`${masterdataUri}\\S+${masterdataPath}\\S+`);

        mock.onDelete(url).timeout();

        await controller.deleteMasterdata(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(masterdataresponse);
    });

});