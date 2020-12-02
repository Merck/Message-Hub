/*
 * EPCIS MESSAGING HUB - MASTERDATA SERVICE

 */

import {Pool} from "pg";
import {MasterDataController} from '../../src/controller/masterdata-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import { createTextChangeRange } from "typescript";

jest.mock('../../src/utils/common-utils', () => {
    const mLogger = {
        error: jest.fn((message) => console.log(message)),
        warn: jest.fn((message) => console.log(message)),
        info: jest.fn((message) => console.log(message))
    }

    const mCommonUtils = {
        //mock this so it returns the same ID for each test
        generateID: jest.fn(() => {
            return "123345-12345-12345";
        }),
        log: jest.fn((path: any) => {
            return mLogger;
        }),
        decodeBase64: jest.fn((value: string) => {
            return "somevalue";
        })
    };
    return {
        CommonUtils: jest.fn(() => mCommonUtils)
    };
});

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn().mockRejectedValueOnce(new Error()),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
    };
    return {
        Pool: jest.fn(() => mPool)
    };
});

jest.mock('amqplib/callback_api', () => {
    let mMsg = {
        properties:{
            contentType: "application/json",
            contentEncoding: "UTF-8",
            headers:{
                masterdata_id: "12345-12345-12345",
                client_id: "678901-678901-678901",
                organization_id: 1
            }
        },
        fields: {
            deliveryTag: 1
        },
        content: '{"EPCISMasterDataDocument":{"schemaVersion":"1","creationDate":"2005-07-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:0037000.00729.0","attribute":[{"id":"urn:epcglobal:fmcg:mda:slt:retail"},{"id":"urn:epcglobal:fmcg:mda:latitude","value":"+18.0000"},{"id":"urn:epcglobal:fmcg:mda:longitude","value":"-70.0000"},{"value":"100 Nowhere Street, FancyCity 99999","id":"urn:epcglobal:fmcg:mda:address"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:201"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:202"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202,402","attribute":[{"id":"urn:epcglobal:fmcg:mda:sslt:202"},{"id":"urn:epcglobal:fmcg:mda:sslta:402"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:201"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:202"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.203","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:203"}]}]}}]}}}}'
    };
    const mChannel = {
        on: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean, deadLetterExchange: string}, callback: any) => callback(null, {
            "queue": "masterdata-processor",
            "messageCount": 0,
            "consumerCount": 0
        }))
    };
    const mChannel2 = {
        on: jest.fn(),
        assertExchange: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean}, callback: any) => callback(null, {
            "queue": "masterdata-holding-local",
            "messageCount": 1,
            "consumerCount": 0
        })),
        bindQueue: jest.fn(),
        consume: jest.fn((queue, callback: any) => callback(mMsg)),
        nack: jest.fn(),
        prefetch: jest.fn(),
        connection: { close: jest.fn() }
    };
    const mConn = {
        createConfirmChannel: jest.fn((callback: any) => callback(null, mChannel)),
        createChannel: jest.fn((callback: any) => callback(null, mChannel2))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(null, mConn))
    };
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'MasterdataController\' ", () => {

    let pool: any;
    let ampq: any;
    let controller: MasterDataController;

    let good_epcis = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <epcismd:EPCISMasterDataDocument xmlns:epcismd="urn:epcglobal:epcis-masterdata:xsd:1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" schemaVersion="1" creationDate="2005-07-11T11:30:47.0Z">
    <EPCISBody>
      <VocabularyList>
        <Vocabulary type="urn:epcglobal:epcis:vtype:BusinessLocation">
          <VocabularyElementList>
            <VocabularyElement id="urn:epc:id:sgln:0037000.00729.0">
              <attribute id="urn:epcglobal:fmcg:mda:slt:retail"/>
              <attribute id="urn:epcglobal:fmcg:mda:latitude" value="+18.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:longitude" value="-70.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:address">100 Nowhere Street, FancyCity 99999</attribute>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202,402">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
              <attribute id="urn:epcglobal:fmcg:mda:sslta:402"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
        <Vocabulary type="urn:epcglobal:epcis:vtype:ReadPoint">
          <VocabularyElementList>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.203">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:203"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
      </VocabularyList>
    </EPCISBody>
    </epcismd:EPCISMasterDataDocument>`;

    let bad_epcis = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <epcismd:EPCISMasterDataDocument xmlns:epcismd="urn:epcglobal:epcis-masterdata:xsd:1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" schemaVersion="1" creationDate="2005-07-11T11:30:47.0Z">
    <EPCISody>
      <VocabularyList>
        <Vocabulary type="urn:epcglobal:epcis:vtype:BusinessLocation">
          <VocabularyElementList>
            <VocabularyElement id="urn:epc:id:sgln:0037000.00729.0">
              <attribute id="urn:epcglobal:fmcg:mda:slt:retail"/>
              <attribute id="urn:epcglobal:fmcg:mda:latitude" value="+18.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:longitude" value="-70.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:address">100 Nowhere Street, FancyCity 99999</attribute>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202,402">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
              <attribute id="urn:epcglobal:fmcg:mda:sslta:402"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
        <Vocabulary type="urn:epcglobal:epcis:vtype:ReadPoint">
          <VocabularyElementList>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.203">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:203"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
      </VocabularyList>
    </EPCISody>
    </epcismd:EPCISMasterDataDocument>`;

    let bad_xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <epcismd:EPCISMasterDataDocument xmlns:epcismd="urn:epcglobal:epcis-masterdata:xsd:1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" schemaVersion="1" creationDate="2005-07-11T11:30:47.0Z">
    <EPCISBody>
      <VocabularyList
        <Vocabulary type="urn:epcglobal:epcis:vtype:BusinessLocation">
          <VocabularyElementList>
            <VocabularyElement id="urn:epc:id:sgln:0037000.00729.0">
              <attribute id="urn:epcglobal:fmcg:mda:slt:retail"/>
              <attribute id="urn:epcglobal:fmcg:mda:latitude" value="+18.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:longitude" value="-70.0000"/>
              <attribute id="urn:epcglobal:fmcg:mda:address">100 Nowhere Street, FancyCity 99999</attribute>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202,402">
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
              <attribute id="urn:epcglobal:fmcg:mda:sslta:402"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
        <Vocabulary type="urn:epcglobal:epcis:vtype:ReadPoint">
          <VocabularyElementList>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.201">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:201"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.202">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:202"/>
            </VocabularyElement>
            <VocabularyElement id="urn:epcglobal:fmcg:ssl:0037000.00729.203">
              <attribute id="urn:epcglobal:epcis:mda:site">urn:epc:id:sgln:0037000.00729.0</attribute>
              <attribute id="urn:epcglobal:fmcg:mda:sslt:203"/>
            </VocabularyElement>
          </VocabularyElementList>
        </Vocabulary>
      </VocabularyList>
    </EPCISBody>
    </epcismd:EPCISMasterDataDocument>`;


    beforeAll(() => {
        jest.resetModules();
        jest.setTimeout(10000);

        //these values don't matter, they just have to be set
        process.env = {
            PGCERT: "",
            RABBITMQ_CERT: "",
            DATA_PRIVACY_RULES_SERVICE: "http://localhost:9000",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            ALERT_SERVICE: "http://localhost:9003",
            MASTERDATA_BFF: "https://messaging-hub.com",
            BLOCKCHAIN_LAB_ADAPTER_SERVICE: "http://blockchain-lab-adapter:8080"
        };
        pool = new Pool();
        controller = new MasterDataController();
    });
    describe("Check class \'MasterdataController\' for masterdata processor queue", () => {

    test('postMasterdataForClient should 200 when all is good, no DPRs', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const callbackResponse = {
            callback: "https://messaging-hub.com/masterdata/123345-12345-12345/status",
            message: "Processing",
            success: true
        };

        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('postMasterDataForClient should 200 when all is good, with DPRs', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [{"id":143,"organization_id":1,"data_field":6,"can_store":false,"order":1,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value"}];

        const callbackResponse = {
            callback: "https://messaging-hub.com/masterdata/123345-12345-12345/status",
            message: "Accepted",
            success: true
        };

        pool.query.mockResolvedValueOnce({rows: [], rowCount: 0})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('postMasterDataForClient should 200 when all is good, with DPRs, multiple redact', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [{"id":143,"organization_id":1,"data_field":6,"can_store":false,"order":1,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value"},{"id":144,"organization_id":1,"data_field":7,"can_store":true,"order":2,"datafield_type":"masterdata","datafield_display":"Read Point","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:ReadPoint')]..attribute[?(@.id==='urn:epcglobal:epcis:mda:site')].value"}];

        const callbackResponse = {
            callback: "https://messaging-hub.com/masterdata/123345-12345-12345/status",
            message: "Accepted",
            success: true
        };

        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": false,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });


    test('postMasterDataForClient should 400 when xml is bad', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = bad_xml;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Invalid XML. Extra content at the end of the document."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(500, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postMasterDataForClient should 400 when xml is invalid', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = bad_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "XML doesn't comply with EPCIS standard. invalid xml (status=WITH_ERRORS) [error] cvc-complex-type.2.4.a: Invalid content was found starting with element 'EPCISody'. One of '{EPCISHeader, EPCISBody}' is expected. (3:15)."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postMasterDataForClient should 400 when user and org are undetermined', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postMasterDataForClient should 400 when data privacy fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Couldn't get data privacy rules from data-privacy-rules-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(400, dprResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });


    /** getMasterdataForClient **/

    test('getMasterdataForClient should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const eventResponse = [
            {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            },
            {
                "destination_name": "Mock Adapter 2",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];

        const response = {

            "id": "41701768-574d-417c-b993-700c631709c1",
            "timestamp": "2020-09-10T09:32:29.581Z",
            "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            "organization_id": 1,
            "source": "System 1 for Org 1",
            "status": "on_ledger",
            "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
            "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ]
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataForClient should 200 when all is good but no destination', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const eventResponse = [
            {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            }
        ];
        const eventDestinationResponse: any = [];

        const response = {

            "id": "41701768-574d-417c-b993-700c631709c1",
            "timestamp": "2020-09-10T09:32:29.581Z",
            "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            "organization_id": 1,
            "source": "System 1 for Org 1",
            "status": "on_ledger",
            "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
            "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            "destinations": []
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataForClient should 400 when org service fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "bad request"
        };

        const response = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getMasterdataForClient should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "no master data found"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        pool.query.mockResolvedValue({rows: [], rowCount: 0})

        await controller.getMasterdataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getMasterdataForClient should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "Couldn't retrieve masterdata details from database"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getMasterdataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getMasterdataForOrganization **/

    test('getMasterdataForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = [
            {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}"
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            },
            {
                "destination_name": "Mock Adapter 2",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];

        const response = {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ]
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataForOrganization should 200 when all is good but no destination', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = [
            {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}"
            }
        ];
        const eventDestinationResponse: any = [];

        const response = {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            "destinations": []
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataForOrganization should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no master data found"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getMasterdataForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve masterdata details from database"
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    /**  getAllMasterdataForClient**/

        test('getAllMasterdataForClient should 200 when all is good', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const eventResponse = [
                {
                    "id": "41701768-574d-417c-b993-700c631709c1",
                    "timestamp": "2020-09-10T09:32:29.581Z",
                    "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                    "organization_id": 1,
                    "source": "System 1 for Org 1",
                    "status": "on_ledger",
                    "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                    "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                },
                {
                    "id": "41701768-574d-417c-b993-700c631709c2",
                    "timestamp": "2020-09-11T09:32:29.581Z",
                    "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                    "organization_id": 1,
                    "source": "System 1 for Org 1",
                    "status": "on_ledger",
                    "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                    "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                }
            ];
            const eventDestinationResponse1 = [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ];
            const eventDestinationResponse2 = [
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ];
    
            const response = [{
    
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                "destinations": [
                    {
                        "destination_name": "Mock Adapter",
                        "status": "on_ledger",
                        "timestamp": "2020-08-14T16:16:10.099Z",
                        "blockchain_response": "Got it thanks"
                    }
                ]
            }, {
    
                "id": "41701768-574d-417c-b993-700c631709c2",
                "timestamp": "2020-09-11T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                "destinations": [
                    {
                        "destination_name": "Mock Adapter 2",
                        "status": "on_ledger",
                        "timestamp": "2020-08-14T16:16:10.099Z",
                        "blockchain_response": "Got it thanks"
                    }
                ]
            }];
    
            pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
                .mockResolvedValueOnce({rows: eventDestinationResponse1, rowCount: eventDestinationResponse1.length})
                .mockResolvedValueOnce({rows: eventDestinationResponse2, rowCount: eventDestinationResponse2.length})
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            await controller.getAllMasterdataForClient(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    
        test('getAllMasterdataForClient should 200 when all is good but no destination', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const eventResponse = [
                {
                    "id": "41701768-574d-417c-b993-700c631709c1",
                    "timestamp": "2020-09-10T09:32:29.581Z",
                    "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                    "organization_id": 1,
                    "source": "System 1 for Org 1",
                    "status": "on_ledger",
                    "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                    "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                },
                {
                    "id": "41701768-574d-417c-b993-700c631709c2",
                    "timestamp": "2020-09-11T09:32:29.581Z",
                    "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                    "organization_id": 1,
                    "source": "System 1 for Org 1",
                    "status": "on_ledger",
                    "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                    "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                }
            ];
            const eventDestinationResponse1 = [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ];
            const eventDestinationResponse2:any = [];
    
            const response = [{
    
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                "destinations": [
                    {
                        "destination_name": "Mock Adapter",
                        "status": "on_ledger",
                        "timestamp": "2020-08-14T16:16:10.099Z",
                        "blockchain_response": "Got it thanks"
                    }
                ]
            }, {
    
                "id": "41701768-574d-417c-b993-700c631709c2",
                "timestamp": "2020-09-11T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
                "destinations": []
            }];
    
            pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
                .mockResolvedValueOnce({rows: eventDestinationResponse1, rowCount: eventDestinationResponse1.length})
                .mockResolvedValueOnce({rows: eventDestinationResponse2, rowCount: eventDestinationResponse2.length})
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            await controller.getAllMasterdataForClient(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('getAllMasterdataForClient should 400 when org service fails', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                success: false,
                message: "bad request"
            };
    
            const response = {
                success: false,
                message: "Couldn't get organization from organization-service."
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            await controller.getAllMasterdataForClient(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    
        test('getAllMasterdataForClient should 404 when masterdata is not found', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const response = {
                success: false,
                message: "no master data found"
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            pool.query.mockResolvedValue({rows: [], rowCount: 0})
    
            await controller.getAllMasterdataForClient(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    
        test('getAllMasterdataForClient should 500 when postgres query fails', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const response = {
                success: false,
                message: "Couldn't retrieve masterdata details from database"
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
            pool.query.mockRejectedValue(new Error("bad query"));
    
            await controller.getAllMasterdataForClient(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(500);
        });

    /** getAllMasterdataForOrganization **/

    test('getAllMasterdataForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = [
            {
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}"
            },
            {
                "id": "41701768-574d-417c-b993-700c631709c2",
                "timestamp": "2020-09-11T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}"
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];
        const eventDestinationResponse2:any = [];

        const response = [{
                "id": "41701768-574d-417c-b993-700c631709c1",
                "timestamp": "2020-09-10T09:32:29.581Z",
                "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
                "organization_id": 1,
                "source": "System 1 for Org 1",
                "status": "on_ledger",
                "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
                "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ]
        }, {
            "id": "41701768-574d-417c-b993-700c631709c2",
            "timestamp": "2020-09-11T09:32:29.581Z",
            "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f",
            "organization_id": 1,
            "source": "System 1 for Org 1",
            "status": "on_ledger",
            "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          <attribute id=\"urn:epcglobal:epcis:mda:site\">urn:epc:id:sgln:0037000.00729.0</attribute>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n",
            "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"urn:epc:id:sgln:0037000.00729.0\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}",
        "destinations": []
    }];

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse2, rowCount: eventDestinationResponse2.length})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getAllMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAllMasterdataForOrganization should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no master data found"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getAllMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getAllMasterdataForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve masterdata details from database"
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getAllMasterdataForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    
    /** getMasterdataStatusForClient **/

    test('getMasterdataStatusForClient should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const eventResponse = [
            {
                "status": "on_ledger"
            }
        ];

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventResponse[0]);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataStatusForClient should 400 when org service fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "bad request"
        };

        const response = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getMasterdataStatusForClient should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "no master data found"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: [], rowCount: 0})

        await controller.getMasterdataStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });
/*
    test('getMasterdataStatusForClient should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.params.masterdata_id = "1234-8484-458745"
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "Couldn't retrieve masterdata status from database"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getMasterdataStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

*/
    /** getDistinctMasterdataSourcesForOrganization **/

    test('getDistinctMasterdataSourcesForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const sourceResponse = [
            {
                source: "Source 1"
            },
            {
                source: "Source 2"
            },
            {
                source: "Source 3"
            }
        ]
        const response = ["Source 1", "Source 2", "Source 3"];

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: sourceResponse, rowCount: sourceResponse.length});

        await controller.getDistinctMasterdataSourcesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });
/*
    test('getDistinctMasterdataSourcesForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve unique masterdata sources from database"
        };

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getDistinctMasterdataSourcesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
*/

    /** getDistinctMasterdataDestinationsForOrganization **/

    test('getDistinctMasterdataDestinationsForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const destinationResponse = [
            {
                destination: "Destination 1"
            },
            {
                destination: "Destination 2"
            },
            {
                destination: "Destination 3"
            }
        ]
        const response = ["Destination 1", "Destination 2", "Destination 3"];

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: destinationResponse, rowCount: destinationResponse.length});

        await controller.getDistinctMasterdataDestinationsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDistinctMasterdataDestinationsForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve unique masterdata destinations from database"
        };

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getDistinctMasterdataDestinationsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    test('get MasterdataQueue MessagesCount should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "queue": "masterdata-processor",
            "messageCount": 1,
            "consumerCount": 0
        };
        await controller.getMasterdataQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });
    });

       /** deleteMasterdataForOrg **/

       test('deleteMasterdataForOrg should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = { success: true, message: "master data is deleted" };


        pool.query.mockResolvedValueOnce({ rowCount: 4})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.deleteMasterdataForOrg(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteMasterdataForOrg should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no master data found"
        };

        pool.query.mockResolvedValue({ rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.deleteMasterdataForOrg(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteMasterdataForOrg should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't delete masterdata from database."
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.deleteMasterdataForOrg(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

        /** deleteMasterdata **/

        test('deleteMasterdata should 200 when all is good', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const eventResponse = { success: true, message: "master data is deleted" }
            pool.query.mockResolvedValueOnce({rowCount: 5})
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            await controller.deleteMasterdata(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(eventResponse);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    
        test('deleteMasterdata should 400 when org service fails', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                success: false,
                message: "bad request"
            };
    
            const response = {
                success: false,
                message: "Couldn't get organization from organization-service."
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            await controller.deleteMasterdata(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    
        test('deleteMasterdata should 404 when masterdata is not found', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const response = {
                success: false,
                message: "no master data found"
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
    
            pool.query.mockResolvedValue({rows: [], rowCount: 0})
    
            await controller.deleteMasterdata(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    
        test('deleteMasterdata should 500 when postgres query fails', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
    
            const res = mockResponse();
    
            let mock = new MockAdapter(axios);
    
            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
    
            const response = {
                success: false,
                message: "Couldn't delete masterdata from database."
            };
    
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
            pool.query.mockRejectedValue(new Error("bad query"));
    
            await controller.deleteMasterdata(req, res);
    
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(response);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        
    test('Set MasterData queue status should 200 ', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "events_paused": false,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            "id": 12,
            "events_paused": false,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        pool.query.mockResolvedValue({rows: [dprResponse], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Set MasterData queue status should 400 with missing request ', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing events_paused in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    
    test('Set MasterData queue status should 400 with missing request 2', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "events_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing masterdata_paused in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    
    test('Set MasterData queue status should 400 with missing request 3', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "masterdata_paused": true,
            "events_paused": false
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing updated_by in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Set masterdata queue status should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const request= {
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't set the masterdata processing queue status to database."
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.setMasterdataQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getMasterdataFromBlockchain **/
    test('getMasterdataFromBlockchain should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataStatusResponse = [{
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "status": "on_ledger"
        }];

        const response = {
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "message": "test"
        };

        pool.query.mockResolvedValue({rows: masterdataStatusResponse, rowCount: 1});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960' ).reply(200, response);

        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getMasterdataFromBlockchain should 404 when masterdata is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no masterdata found"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960' ).reply(404, response);

        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getMasterdataFromBlockchain should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve masterdata status from database"
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getMasterdataFromBlockchain should 500 when network errors', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.masterdataId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const masterdataStatusResponse = [{
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "status": "on_ledger"
        }];

        const response = {
            success: false,
            message: "Error retrieving masterdata from blockchain for masterdata id 0f49befb-84e2-45ef-b9ca-dc545787d960 on blockchain blockchain-lab-adapter for org 1: Network Error"
        };

        pool.query.mockResolvedValue({rows: masterdataStatusResponse, rowCount: 1});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/masterdata/0f49befb-84e2-45ef-b9ca-dc545787d960' ).networkError();

        await controller.getMasterdataFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});