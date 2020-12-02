/*
 * EPCIS MESSAGING HUB - MASTERDATA SERVICE

 */

import {Pool} from "pg";
import {MasterDataController} from '../../src/controller/masterdata-controller';
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
        connect: jest.fn().mockRejectedValueOnce(new Error()).mockRejectedValueOnce(new Error()),
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
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(new Error(), null)),
        assertQueue: jest.fn((queue_name: string, {durable: boolean, deadLetterExchange: string}, callback: any) => callback(new Error(), null)),
    };
    const mChannel2 = {
      on: jest.fn(),
      assertExchange: jest.fn(),
      publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(new Error(), null)),
      assertQueue: jest.fn((queue_name: string, {durable: boolean}, callback: any) => callback(new Error(), null)),
      bindQueue: jest.fn(),
      consume: jest.fn((queue, callback: any) => callback(mMsg)),
      nack: jest.fn(),
      prefetch: jest.fn(),
      connection: { close: jest.fn() }
  };
    const mConn = {
        createConfirmChannel: jest.fn((callback: any) => callback(new Error(), mChannel)),
        createChannel: jest.fn((callback: any) => callback(new Error(), mChannel2))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(new Error(), mConn))
    };
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'Masterdata Controller\'to handle errors in queue ", () => {

    let pool: any;
    let ampq: any;
    let controller: MasterDataController;
    let processor: RabbitMQProcessor;
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
        processor = new RabbitMQProcessor();
    });

    test('test rabbit mq connection  and channel, return error', async () => {

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.start();

        expect(reportError).toBeCalledTimes(2);
    });
    
    test('postMasterdataForClient should rabbit mq error when all is good, no DPRs', async () => {
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
            message: "Unknown error publishing masterdata to RabbitMQ channel.",
            success: false
        };
        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postMasterDataForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postMasterdataForClient should rabbit mq error when publishing in holding queue when all is good, no DPRs', async () => {
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
          message: "Unknown error publishing masterdata to RabbitMQ channel.",
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
      mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

      await controller.postMasterDataForClient(req, res);

      expect(res.send).toHaveBeenCalledTimes(1)
      expect(res.send.mock.calls.length).toBe(1);
      expect(res.send).toHaveBeenCalledWith(callbackResponse);
      expect(res.status).toHaveBeenCalledWith(400);
  });

  /*test('test rabbit mq connection  and channel on consumeMasterdataHoldingQueue, return error', async () => {

    let reportError = jest.spyOn(ErrorService, 'reportError');

    await processor.consumeMasterdataHoldingQueue().catch(err => {

    });

    expect(reportError).toBeCalledTimes(7);
});*/


    test('get MasterdataQueue MessagesCount should 400 when rabbit mq error', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "message": "RabbitMQ channel error.",
            "success": false
        };
        await controller.getMasterdataQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    
    
});