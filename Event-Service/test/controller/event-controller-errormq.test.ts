/*
 * EPCIS MESSAGING HUB - EVENT SERVICE

 */

import {Pool} from "pg";
import {EventController} from '../../src/controller/event-controller';
import {RabbitMQProcessor} from '../../src/processor/rabbit-mq-processor';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import {ErrorService} from "../../src/services/error-service";

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
    const mChannel = {
        on: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(new Error(), null)),
        assertQueue: jest.fn((queue_name: string, {durable: boolean, deadLetterExchange: string}, callback: any) => callback(new Error(), null)),
    };
    const mConn = {
        createConfirmChannel: jest.fn((callback: any) => callback(new Error(), mChannel))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(new Error(), mConn))
    };
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'EventController\' check rabbitmq error", () => {

    let pool: any;
    let ampq: any;
    let controller: EventController;
    let processor: RabbitMQProcessor;

    let good_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043584</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    beforeAll(() => {
        jest.resetModules();
        jest.setTimeout(10000);

        //these values don't matter, they just have to be set
        process.env = {
            PGCERT: "",
            RABBITMQ_CERT: "",
            DATA_PRIVACY_RULES_SERVICE: "http://localhost:9000",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            SEARCH_SERVICE: "http://localhost:9002",
            ALERT_SERVICE: "http://localhost:9003",
            EVENT_BFF: "https://messaging-hub.com"

        };
        pool = new Pool();
        controller = new EventController();
        processor = new RabbitMQProcessor();
    });

    test('test rabbit mq connection  and channel, return error', async () => {

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.start();

        expect(reportError).toBeCalledTimes(2);
    });

    
    test('postEventForClient should rabbit mq error when all is good, no DPRs', async () => {
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
            message: "Unknown error publishing event to RabbitMQ channel.",
            success: false
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, []);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    
    test('test rabbit mq connection  and channel, return error', async () => {

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.start();

        expect(reportError).toBeCalledTimes(6);
    });

    
    test('postEventForClient should rabbit mq error when publishing in holding queue when all is good, no DPRs', async () => {
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
            message: "Unknown error publishing event to RabbitMQ channel.",
            success: false
        };
        pool.query.mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1})
        .mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, []);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

        
    test('get EventQueue MessagesCount should 400 when rabbit mq error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "message": "RabbitMQ channel error.",
            "success": false
        };
        await controller.getEventQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

})