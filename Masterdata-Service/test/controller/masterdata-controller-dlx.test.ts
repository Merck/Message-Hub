/*
 * EPCIS MESSAGING HUB - MASTERDATA SERVICE

 */

import {Pool} from "pg";
import {MasterDataController} from '../../src/controller/masterdata-controller';
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
        assertExchange: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean}, callback: any) => callback(null, {
            "queue": "masterdata-processor-deadletter",
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


describe("Check class \'Masterdata Controller\'to handle deadletter queue ", () => {

    let pool: any;
    let ampq: any;
    let controller: MasterDataController;

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
            RABBITMQ_MASTERDATA_EXCHANGE: "exchange",
            RABBITMQ_MASTERDATA_QUEUE: "queue",
            RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE: "",
            RABBITMQ_MASTERDATA_DEADLETTER_QUEUE: "",
            ROUTING_RULES_SERVICE: "http://localhost:9000",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            ALERT_SERVICE: "http://localhost:9003"

        };
        pool = new Pool();
        controller = new MasterDataController();
    });

    test('get MasterdataDeadletter Queue MessagesCount should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "queue": "masterdata-processor-deadletter",
            "messageCount": 1,
            "consumerCount": 0
        };
        await controller.getMasterdataDLXQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    
    test('retry MasterdataDeadletter Queue Message should 200 when all is good and masterdata processing is not paused', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = { success: true, message: 'Success in retrying the failed masterdata messages.' };

        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": true,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1});
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retry MasterdataDeadletter Queue Message should 200 when all is good and masterdata processing paused.', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = { success: true, message: 'Success in retrying the failed masterdata messages.' };
        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": true,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retry MasterdataDeadletter Queue Message should report error when update of status fails.', async () => {

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
        await controller.retryMasterdataQueueMessagesDLX(req, res);

        expect(reportError).toBeCalledTimes(1);
    });
})