/*
 * EPCIS MESSAGING HUB - QUERY BFF

 */

import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import {QueryController} from "../../src/controller/query-controller";

const {mockRequest, mockResponse} = require('../utils/interceptor');

const access_token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk4NTUyMjEyLCJhdWQiOlsiM2U4YWQxMDItZWNkOC00NjdmLWE5ZDAtNmZhY2Q3NzM0YmM4Il0sInN1YiI6IjNlOGFkMTAyLWVjZDgtNDY3Zi1hOWQwLTZmYWNkNzczNGJjOCIsImFtciI6WyJhcHBpZF9jbGllbnRfY3JlZGVudGlhbHMiXSwiaWF0IjoxNTk4NTQ4NjEyLCJ0ZW5hbnQiOiI3ZTRmMTZjZC1hNWI4LTQ1YTItOWQ2NS00MDk2YTQ4OGU5ZWUiLCJzY29wZSI6ImFwcGlkX2RlZmF1bHQifQ.CwI0xcfuiyYGncaOnQ_acxm3QboYTILnCtNIbep2raOiJz2Vx91RcN8PzkW6vS6WAfbzIeIwHedsxtjXT-IR0qJ4Ua0cd69ON_k_XJU3aMJW4efQGcKmHNbm6SY2rUzxpIcFs_3ot90o4C3nXJg1dGWrTQZXqbvGsOl54i7v0rG2xJhvGsK40rPy4g6BK1aCkJHjt4rfh647Z5XdRFmumQ79JcnFOZslPy4KDCndsxi6iXPQb9d3sOgI7fJ4nw-IHPymZgpegB752holjR0cdgLvCm6QidjNqfDdfYvXxGe2EdhajgMllL_nl33dcxhjYllwjBpdlefIIzjgCM_hLA";

describe("Check \'QueryController\' ", () => {

    let controller: QueryController;

    beforeAll(() => {
        jest.resetModules();
        //it doesn't matter what these are, they just have to be set
        if (!process.env.QUERY_SERVICE) {
            process.env = {
                QUERY_SERVICE: "http://somehost:9000"
            }
        }
        controller = new QueryController();
    });
    let good_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    <param>
    <name>MATCH_epc</name>
    <value>
    <string>urn:epc:id:sgln:1414141.12945.32a%2Fb</string>
    </value>
    </param>
    <param>
    <name>EQ_action</name>
    <value>
    <string>ADD</string>
    </value>
    </param>
    <param>
    <name>GE_eventTime</name>
    <value>
    <string>2020-11-01T10:28:08.717Z</string>
    </value>
    </param>
    <param>
    <name>LT_eventTime</name>
    <value>
    <string>2020-11-02T10:28:08.717Z</string>
    </value>
    </param>
    <param>
    <name>EQ_disposition</name>
    <value>
    <string>urn:epcglobal:cbv:disp:active</string>
    </value>
    </param>
    <param>
    <name>EQ_readPoint</name>
    <value>
    <string></string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let epics_response = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <epcis:EPCISDocument xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" schemaVersion=\"1.1\" creationDate=\"2015-04-14T11:14:25.411-04:00\" xmlns:cbvmda=\"urn:epcglobal:cbv:mda\"><EPCISBody><epcisq:QueryResults xmlns:epcisq=\"urn:epcglobal:epcis-query:xsd:1\"><queryName>SimpleEventQuery</queryName><resultsBody><EventList><ObjectEvent><eventTime>2020-11-01T10:28:08.717Z</eventTime><eventTimeZoneOffset>-05:00</eventTimeZoneOffset><epcList><epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc></epcList><action>ADD</action><bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep><disposition>urn:epcglobal:cbv:disp:active</disposition><readPoint><id>urn:epc:id:sgln:036800.111111.0</id></readPoint><bizLocation><id>urn:epc:id:sgln:036800.111111.0</id></bizLocation><extension><ilmd><cbvmda:lotNumber>LOT123</cbvmda:lotNumber><cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate></ilmd></extension></ObjectEvent><ObjectEvent><eventTime>2020-11-01T10:28:08.717Z</eventTime><eventTimeZoneOffset>-05:00</eventTimeZoneOffset><epcList><epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc></epcList><action>ADD</action><bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep><disposition>urn:epcglobal:cbv:disp:active</disposition><readPoint><id>urn:epc:id:sgln:036800.111111.0</id></readPoint><bizLocation><id>urn:epc:id:sgln:036800.111111.0</id></bizLocation><extension><ilmd><cbvmda:lotNumber>LOT123</cbvmda:lotNumber><cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate></ilmd></extension></ObjectEvent></EventList></resultsBody></epcisq:QueryResults></EPCISBody></epcis:EPCISDocument>`

    /** postQuery **/
    
    test('postQuery 200 Response', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        req.body = good_epcis;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const queryUri = process.env.QUERY_SERVICE + "/client/"
        const queryPath = "/queries"
        const url = new RegExp(`${queryUri}\\S+${queryPath}`);

        mock.onPost(url).reply(200, epics_response);

        await controller.postQuery(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(epics_response);
    });

    test('postQuery should 400 Response when bad XML is passed', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const queryresponse = {
            success: false,
            message: "Bad XML"
        }

        const queryUri = process.env.QUERY_SERVICE + "/client/"
        const queryPath = "/queries"
        const url = new RegExp(`${queryUri}\\S+${queryPath}`);

        mock.onPost(url).reply(400, queryresponse);

        await controller.postQuery(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(queryresponse);
    });

    test('postQuery should 401 Response when no token in header', async () => {
        let req = mockRequest();
        let res = mockResponse();

        const queryresponse = {
            success: false,
            message:  "Error getting client id from request token. No authorization header received"
        }

        await controller.postQuery(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(queryresponse);
    });

    test('postQuery should 500 Response when network error', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const queryresponse = {
            success: false,
            message: "Error posting query to query-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. Network Error"
        }

        const queryUri = process.env.QUERY_SERVICE + "/client/"
        const queryPath = "/queries"
        const url = new RegExp(`${queryUri}\\S+${queryPath}`);

        mock.onPost(url).networkError();

        await controller.postQuery(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(queryresponse);
    });

    test('postQuery should 500 Response when network timeout', async () => {
        let req = mockRequest();
        req.headers.authorization = access_token;
        let res = mockResponse();

        let mock = new MockAdapter(axios);

        const queryresponse = {
            success: false,
            message:  "Error posting query to query-service for client id 3e8ad102-ecd8-467f-a9d0-6facd7734bc8. timeout of 0ms exceeded"
        }

        const queryUri = process.env.QUERY_SERVICE + "/client/"
        const queryPath = "/queries"
        const url = new RegExp(`${queryUri}\\S+${queryPath}`);

        mock.onPost(url).timeout();

        await controller.postQuery(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(queryresponse);
    });
});