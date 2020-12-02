/*
 * EPCIS MESSAGING HUB - MASTERDATA PROCESSOR

 */

import {Pool} from "pg";
import {RabbitMQProcessor} from "../../src/processor/rabbit-mq-processor";
import {ErrorService} from "../../src/services/error-service";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

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

let mMsg:any;

jest.mock('amqplib/callback_api', () => {
    const mQueue = {};
    const mChannel = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn((queueName:string, options: any, callback: any) => callback(null, mQueue)),
        bindQueue: jest.fn(),
        consume: jest.fn((queue, callback: any) => callback(mMsg)),
        nack: jest.fn()
    };
    const mConn = {
        createChannel: jest.fn((callback: any) => callback(null, mChannel))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(null, mConn))
    };
});

describe("Check class \'RabbitMQProcessor\' ", () => {

    let pool: any;
    let processor: RabbitMQProcessor;

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
        processor = new RabbitMQProcessor();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('test message with no contentType', async () => {
        mMsg = {
            properties:{
                contentType: null,
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();
        expect(reportError).toBeCalledTimes(2);

        expect(reportError).toHaveBeenNthCalledWith(1, 1, "678901-678901-678901", 1001, null, null);
        expect(reportError).toHaveNthReturnedWith(1,"Received a message in processing queue without a content type.  Assuming it is application/json");

        expect(reportError).toHaveBeenLastCalledWith(1, "678901-678901-678901", 1006, null, "678901-678901-678901");
        expect(reportError).toHaveLastReturnedWith("Received a message in processing queue without any content from client id 678901-678901-678901");
    });

    test('test message with no contentEncoding', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: null,
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();

        expect(reportError).toBeCalledTimes(2);

        expect(reportError).toHaveBeenNthCalledWith(1, 1, "678901-678901-678901", 1002, null, null);
        expect(reportError).toHaveNthReturnedWith(1,"Received a message in processing queue without a content encoding.  Assuming it is UTF-8");

        expect(reportError).toHaveBeenLastCalledWith(1, "678901-678901-678901", 1006, null, "678901-678901-678901");
        expect(reportError).toHaveLastReturnedWith("Received a message in processing queue without any content from client id 678901-678901-678901");
    });

    test('test message with no masterdata id', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: null,
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();

        expect(reportError).toBeCalledTimes(1);

        expect(reportError).toHaveBeenCalledWith(1, "678901-678901-678901", 1003, null, null);
        expect(reportError).toHaveReturnedWith("Received a message in processing queue without a masterdata id");
    });

    test('test message with no client id', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: null,
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();

        expect(reportError).toBeCalledTimes(1);

        expect(reportError).toHaveBeenCalledWith( 1, null, 1004, null, null);
        expect(reportError).toHaveReturnedWith("Received a message in processing queue without a client id");
    });

    test('test message with no org id', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: null
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();

        expect(reportError).toBeCalledTimes(1);

        expect(reportError).toHaveBeenCalledWith( null, "678901-678901-678901", 1005, null, "678901-678901-678901");
        expect(reportError).toHaveReturnedWith("Received a message in processing queue without a organization id from client id 678901-678901-678901");
    });

    test('test message with no content', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();
        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toBeCalledWith(1, "678901-678901-678901", 1006, null, "678901-678901-678901");
        expect(reportError).toReturnWith("Received a message in processing queue without any content from client id 678901-678901-678901");
    });

    test('test message with empty content', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: ""
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();
        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toBeCalledWith(1, "678901-678901-678901", 1006, null, "678901-678901-678901");
        expect(reportError).toReturnWith("Received a message in processing queue without any content from client id 678901-678901-678901");
    });

    test('test message with bad content', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: "badJSON {]]"
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();
        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("An unknown error occurred while determining a route for masterdata with ID 12345-12345-12345. Unexpected token b in JSON at position 0");
    });

    test('test message routing rules service fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1.0","creationDate":"2005-08-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:33333.5555.982.0","attribute":[{"value":18,"id":"http://epcis.example.com/mda/latitude"},{"value":-70,"id":"http://epcis.example.com/mda/longitude"},{"id":"http://epcis.example.com/mda/address","address":{"Street":"100 Nowhere Street","City":"Fancy","State":"DC","Zip":99999}}],"children":{"id":["urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0"]}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},"children":{"id":"urn:epc:id:sgln:7673488.982.03"}},{"id":"urn:epc:id:sgln:007673488.982.003","attribute":[{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},{"value":402,"id":"urn:epcglobal:cbv:mda:ssa"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:00781302488.9999.001","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.2332.8002","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":202,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.981.0203","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":203,"id":"urn:epcglobal:cbv:mda:sst"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(500, {success:false, message:"bork!"});
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("Error retrieving the routing rules for organization from routing rules service for masterdata with ID 12345-12345-12345. Error: Request failed with status code 500");
    });

    test('test message with no routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1.0","creationDate":"2005-08-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:33333.5555.982.0","attribute":[{"value":18,"id":"http://epcis.example.com/mda/latitude"},{"value":-70,"id":"http://epcis.example.com/mda/longitude"},{"id":"http://epcis.example.com/mda/address","address":{"Street":"100 Nowhere Street","City":"Fancy","State":"DC","Zip":99999}}],"children":{"id":["urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0"]}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},"children":{"id":"urn:epc:id:sgln:7673488.982.03"}},{"id":"urn:epc:id:sgln:007673488.982.003","attribute":[{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},{"value":402,"id":"urn:epcglobal:cbv:mda:ssa"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:00781302488.9999.001","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.2332.8002","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":202,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.981.0203","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":203,"id":"urn:epcglobal:cbv:mda:sst"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("Error retrieving the routing rules for organization from routing rules service for masterdata with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
    });

    test('test message with no routing rules update masterdata fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1.0","creationDate":"2005-08-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:33333.5555.982.0","attribute":[{"value":18,"id":"http://epcis.example.com/mda/latitude"},{"value":-70,"id":"http://epcis.example.com/mda/longitude"},{"id":"http://epcis.example.com/mda/address","address":{"Street":"100 Nowhere Street","City":"Fancy","State":"DC","Zip":99999}}],"children":{"id":["urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0"]}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},"children":{"id":"urn:epc:id:sgln:7673488.982.03"}},{"id":"urn:epc:id:sgln:007673488.982.003","attribute":[{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},{"value":402,"id":"urn:epcglobal:cbv:mda:ssa"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:00781302488.9999.001","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.2332.8002","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":202,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.981.0203","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":203,"id":"urn:epcglobal:cbv:mda:sst"}]}]}}]}}}}'
        };

        pool.query.mockRejectedValueOnce(new Error("bad query")).mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith(1, "Error retrieving the routing rules for organization from routing rules service for masterdata with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
        expect(reportError).toHaveLastReturnedWith("Unable to update masterdata with id 12345-12345-12345 to failed status in database");
    });

    test('test message with no routing rules update masterdata destination fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1.0","creationDate":"2005-08-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:33333.5555.982.0","attribute":[{"value":18,"id":"http://epcis.example.com/mda/latitude"},{"value":-70,"id":"http://epcis.example.com/mda/longitude"},{"id":"http://epcis.example.com/mda/address","address":{"Street":"100 Nowhere Street","City":"Fancy","State":"DC","Zip":99999}}],"children":{"id":["urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0"]}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},"children":{"id":"urn:epc:id:sgln:7673488.982.03"}},{"id":"urn:epc:id:sgln:007673488.982.003","attribute":[{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},{"value":402,"id":"urn:epcglobal:cbv:mda:ssa"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:00781302488.9999.001","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.2332.8002","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":202,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.981.0203","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":203,"id":"urn:epcglobal:cbv:mda:sst"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1}).mockRejectedValueOnce(new Error("bad query"));

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith(1, "Error retrieving the routing rules for organization from routing rules service for masterdata with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
        expect(reportError).toHaveLastReturnedWith("Unable to update masterdata destination with id 12345-12345-12345 to failed status in database");
    });

    test('test message with routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1","creationDate":"2005-07-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:0037000.00729.0","attribute":[{"id":"urn:epcglobal:fmcg:mda:slt:retail"},{"id":"urn:epcglobal:fmcg:mda:latitude","value":"+18.0000"},{"id":"urn:epcglobal:fmcg:mda:longitude","value":"-70.0000"},{"value":"100 Nowhere Street, FancyCity 99999","id":"urn:epcglobal:fmcg:mda:address"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:201"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:202"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202,402","attribute":[{"id":"urn:epcglobal:fmcg:mda:sslt:202"},{"id":"urn:epcglobal:fmcg:mda:sslta:402"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:201"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:202"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.203","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:203"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {"id":228,"organization_id":1,"data_field":9,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value","datafield_prefix":null,"comparator":3,"comparator_operation":"isLike","comparator_display":"is like (wildcard *)","value":"100 Nowhere*","destinations":["mock-adapter"],"order":1}
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPost("http://mock-adapter:8080/adapter/masterdata").reply(200, {success:true, message:"processed"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(0);
    });

    test('test message with no matching routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1.0","creationDate":"2005-08-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:33333.5555.982.0","attribute":[{"value":18,"id":"http://epcis.example.com/mda/latitude"},{"value":-70,"id":"http://epcis.example.com/mda/longitude"},{"id":"http://epcis.example.com/mda/address","address":{"Street":"120 Nowhere Street","City":"Fancy","State":"DC","Zip":99999}}],"children":{"id":["urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0","urn:epc:id:sgln:7673488.982.0"]}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}},{"id":"urn:epc:id:sgln:7673488.982.0","attribute":{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},"children":{"id":"urn:epc:id:sgln:7673488.982.03"}},{"id":"urn:epc:id:sgln:007673488.982.003","attribute":[{"value":202,"id":"urn:epcglobal:cbv:mda:sst"},{"value":402,"id":"urn:epcglobal:cbv:mda:ssa"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:00781302488.9999.001","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":201,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.2332.8002","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":202,"id":"urn:epcglobal:cbv:mda:sst"}]},{"id":"urn:epc:id:sgln:7673488.981.0203","attribute":[{"value":37000007296,"id":"urn:epcglobal:cbv:mda:site"},{"value":203,"id":"urn:epcglobal:cbv:mda:sst"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {"id":228,"organization_id":1,"data_field":9,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value","datafield_prefix":null,"comparator":3,"comparator_operation":"isLike","comparator_display":"is like (wildcard *)","value":"100 Nowhere*","destinations":["mock-adapter"],"order":1}
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/masterdata").reply(200, {success:true, message:"processed"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toHaveReturnedWith( "Unable to determine a route for masterdata with ID 12345-12345-12345 based on current routing rules");
    });

    test('test message with routing rules adapter fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1","creationDate":"2005-07-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:0037000.00729.0","attribute":[{"id":"urn:epcglobal:fmcg:mda:slt:retail"},{"id":"urn:epcglobal:fmcg:mda:latitude","value":"+18.0000"},{"id":"urn:epcglobal:fmcg:mda:longitude","value":"-70.0000"},{"value":"100 Nowhere Street, FancyCity 99999","id":"urn:epcglobal:fmcg:mda:address"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:201"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:202"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202,402","attribute":[{"id":"urn:epcglobal:fmcg:mda:sslt:202"},{"id":"urn:epcglobal:fmcg:mda:sslta:402"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:201"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:202"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.203","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:203"}]}]}}]}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {"id":228,"organization_id":1,"data_field":9,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value","datafield_prefix":null,"comparator":3,"comparator_operation":"isLike","comparator_display":"is like (wildcard *)","value":"100 Nowhere*","destinations":["mock-adapter"],"order":1}
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPost("http://mock-adapter:8080/adapter/masterdata").reply(500, {success:false, message:"bork!"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toHaveReturnedWith( "Failed to process masterdata with id 12345-12345-12345 to the required destination Blockchain adapter: mock-adapter");
    });

    test('test message with routing rules adapter fails and database fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    masterdata_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISMasterDataDocument":{"schemaVersion":"1","creationDate":"2005-07-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:0037000.00729.0","attribute":[{"id":"urn:epcglobal:fmcg:mda:slt:retail"},{"id":"urn:epcglobal:fmcg:mda:latitude","value":"+18.0000"},{"id":"urn:epcglobal:fmcg:mda:longitude","value":"-70.0000"},{"value":"100 Nowhere Street, FancyCity 99999","id":"urn:epcglobal:fmcg:mda:address"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:201"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:202"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202,402","attribute":[{"id":"urn:epcglobal:fmcg:mda:sslt:202"},{"id":"urn:epcglobal:fmcg:mda:sslta:402"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:201"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:202"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.203","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:203"}]}]}}]}}}}'
        };

        pool.query.mockRejectedValueOnce(new Error("bad query"))
        .mockRejectedValueOnce(new Error("bad query"));

        let mock = new MockAdapter(axios);
        let rules = [
            {"id":228,"organization_id":1,"data_field":9,"datafield_type":"masterdata","datafield_display":"Business Location Address","datafield_path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value","datafield_prefix":null,"comparator":3,"comparator_operation":"isLike","comparator_display":"is like (wildcard *)","value":"100 Nowhere*","destinations":["mock-adapter"],"order":1}
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/masterdata").reply(500, {success:false, message:"bork!"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processMasterdata(msg);

        expect(reportError).toBeCalledTimes(3);
        expect(reportError).toHaveNthReturnedWith( 1, "Failed to process masterdata with id 12345-12345-12345 to the required destination Blockchain adapter: mock-adapter");
        expect(reportError).toHaveNthReturnedWith( 2, "Unable to get the display name of the adapter service name mock-adapter from the database for masterdata id 12345-12345-12345");
        expect(reportError).toHaveLastReturnedWith("Unable to update masterdata with id 12345-12345-12345 to failed status in database");
    });

});