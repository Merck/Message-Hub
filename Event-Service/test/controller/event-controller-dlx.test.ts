/*
 * EPCIS MESSAGING HUB - EVENT SERVICE

 */

import {Pool} from "pg";
import {EventController} from '../../src/controller/event-controller';
import {ErrorService} from "../../src/services/error-service";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

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
                event_id: "12345-12345-12345",
                client_id: "678901-678901-678901",
                organization_id: 1
            }
        },
        fields: {
            deliveryTag: 1
        },
        content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
    };
    const mChannel = {
        on: jest.fn(),
        assertExchange: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean}, callback: any) => callback(null, {
            "queue": "event-processor-deadletter",
            "messageCount": 1,
            "consumerCount": 0
        })),
        bindQueue: jest.fn(),
        consume: jest.fn((queue, callback: any) => callback(mMsg)),
        nack: jest.fn(),
        connection: { close: jest.fn() }
    };
    const mChannel2 = {
        on: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn()
    };
    const mConn = {
        createChannel: jest.fn((callback: any) => callback(null, mChannel)),
        createConfirmChannel: jest.fn((callback: any) => callback(null, mChannel2))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(null, mConn))
    };
});


const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'EventController\'to handle deadletter queue ", () => {

    let pool: any;
    let ampq: any;
    let controller: EventController;

    beforeAll(() => {
        jest.resetModules();
        jest.setTimeout(10000);

        //these values don't matter, they just have to be set
        process.env = {
            PGUSER: "",
            PGPASSWORD: "",
            PGHOST: "",
            PGPORT: "",
            PGDATABASE: "",
            PGCERT: "",
            RABBITMQ_PROTOCOL: "amqps",
            RABBITMQ_HOST: "http://localhost:9000",
            RABBITMQ_PORT: "12345",
            RABBITMQ_USER: "user",
            RABBITMQ_PASSWORD: "pw",
            RABBITMQ_CERT: "",
            RABBITMQ_EVENT_EXCHANGE: "exchange",
            RABBITMQ_EVENT_QUEUE: "queue",
            RABBITMQ_EVENT_DEADLETTER_EXCHANGE: "",
            RABBITMQ_EVENT_DEADLETTER_QUEUE: "",
            ROUTING_RULES_SERVICE: "http://localhost:9000",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            SEARCH_SERVICE: "http://localhost:9002",
            ALERT_SERVICE: "http://localhost:9003"

        };
        pool = new Pool();
        controller = new EventController();
    });

    test('get EventDeadletter Queue MessagesCount should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "queue": "event-processor-deadletter",
            "messageCount": 1,
            "consumerCount": 0
        };
        await controller.getEventDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    
    test('retry EventDeadletter Queue Message should 200 when all is good and events processing is resumed.', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);
        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1});
        const eventResponse = { success: true, message: 'Success in retrying the failed event messages.' };
        await controller.retryEventQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retry EventDeadletter Queue Message should 200 when all is good and events processing is paused.', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);
        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": true,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});;
        const eventResponse = { success: true, message: 'Success in retrying the failed event messages.' };
        await controller.retryEventQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retry EventDeadletter Queue Message should should report error when update of status fails.', async () => {
        let reportError = jest.spyOn(ErrorService, 'reportError');
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": true,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockRejectedValue(new Error("bad query"));
        await controller.retryEventQueueMessagesDLX(req, res);

        expect(reportError).toBeCalledTimes(3);
    });
})