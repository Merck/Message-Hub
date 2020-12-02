/*
 * EPCIS MESSAGING HUB - EVENT PROCESSOR
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

describe("Check class \'EventController\' ", () => {

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
                    event_id: "12345-12345-12345",
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
                    event_id: "12345-12345-12345",
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

    test('test message with no event id', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: null,
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            }
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();

        expect(reportError).toBeCalledTimes(1);

        expect(reportError).toHaveBeenCalledWith(1, "678901-678901-678901", 1003, null, null);
        expect(reportError).toHaveReturnedWith("Received a message in processing queue without an event id");
    });

    test('test message with no client id', async () => {
        mMsg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
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
                    event_id: "12345-12345-12345",
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
                    event_id: "12345-12345-12345",
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
                    event_id: "12345-12345-12345",
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
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: "badJSON {]]"
        };

        let reportError = jest.spyOn(ErrorService, 'reportError');
        await processor.start();
        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("An unknown error occurred while determining a route for event with ID 12345-12345-12345. Unexpected token b in JSON at position 0");
    });

    test('test message routing rules service fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISHeader":{"StandardBusinessDocumentHeader":{"HeaderVersion":1,"Sender":{"Identifier":"urn:epc:id:sgln:036800.111111.0"},"Receiver":{"Identifier":"urn:epc:id:sgln:0716163.01122.0"},"DocumentIdentification":{"Standard":"EPCglobal","TypeVersion":1,"InstanceIdentifier":1234567890,"Type":"Events","CreationDateAndTime":"2020-08-28T12:10:16Z"}},"extension":{"EPCISMasterData":{"VocabularyList":{"Vocabulary":[{"VocabularyElementList":{"VocabularyElement":{"attribute":[68000012345,"FDA_NDC_11","My Test Drug","My Pharma LLC","PILL","100mg",500]}}},{"VocabularyElementList":{"VocabularyElement":{"attribute":["My Pharma LLC","3575 Zumstein Ave","Suite 101","Washington","DC","12345-6789","US"]}}}]}}}},"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-08-28T00:28:08.717Z","eventTimeZoneOffset":"-05:00","epcList":{"epc":["urn:epc:id:sgtin:036800.0012345.10000000001","urn:epc:id:sgtin:036800.0012345.10000000002","urn:epc:id:sgtin:036800.0012345.10000000003","urn:epc:id:sgtin:036800.1012345.22222222222"]},"action":"ADD","bizStep":"urn:epcglobal:cbv:bizstep:commissioning","disposition":"urn:epcglobal:cbv:disp:active","readPoint":{"id":"urn:epc:id:sgln:036800.111111.0"},"bizLocation":{"id":"urn:epc:id:sgln:036800.111111.0"},"extension":{"ilmd":{"lotNumber":"LOT123","itemExpirationDate":"2020-12-31"}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(500, {success:false, message:"bork!"});
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("Error retrieving the routing rules for organization from routing rules service for event with ID 12345-12345-12345. Error: Request failed with status code 500");
    });

    test('test message with no routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISHeader":{"StandardBusinessDocumentHeader":{"HeaderVersion":1,"Sender":{"Identifier":"urn:epc:id:sgln:036800.111111.0"},"Receiver":{"Identifier":"urn:epc:id:sgln:0716163.01122.0"},"DocumentIdentification":{"Standard":"EPCglobal","TypeVersion":1,"InstanceIdentifier":1234567890,"Type":"Events","CreationDateAndTime":"2020-08-28T12:10:16Z"}},"extension":{"EPCISMasterData":{"VocabularyList":{"Vocabulary":[{"VocabularyElementList":{"VocabularyElement":{"attribute":[68000012345,"FDA_NDC_11","My Test Drug","My Pharma LLC","PILL","100mg",500]}}},{"VocabularyElementList":{"VocabularyElement":{"attribute":["My Pharma LLC","3575 Zumstein Ave","Suite 101","Washington","DC","12345-6789","US"]}}}]}}}},"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-08-28T00:28:08.717Z","eventTimeZoneOffset":"-05:00","epcList":{"epc":["urn:epc:id:sgtin:036800.0012345.10000000001","urn:epc:id:sgtin:036800.0012345.10000000002","urn:epc:id:sgtin:036800.0012345.10000000003","urn:epc:id:sgtin:036800.1012345.22222222222"]},"action":"ADD","bizStep":"urn:epcglobal:cbv:bizstep:commissioning","disposition":"urn:epcglobal:cbv:disp:active","readPoint":{"id":"urn:epc:id:sgln:036800.111111.0"},"bizLocation":{"id":"urn:epc:id:sgln:036800.111111.0"},"extension":{"ilmd":{"lotNumber":"LOT123","itemExpirationDate":"2020-12-31"}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toReturnWith("Error retrieving the routing rules for organization from routing rules service for event with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
    });

    test('test message with no routing rules update event fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISHeader":{"StandardBusinessDocumentHeader":{"HeaderVersion":1,"Sender":{"Identifier":"urn:epc:id:sgln:036800.111111.0"},"Receiver":{"Identifier":"urn:epc:id:sgln:0716163.01122.0"},"DocumentIdentification":{"Standard":"EPCglobal","TypeVersion":1,"InstanceIdentifier":1234567890,"Type":"Events","CreationDateAndTime":"2020-08-28T12:10:16Z"}},"extension":{"EPCISMasterData":{"VocabularyList":{"Vocabulary":[{"VocabularyElementList":{"VocabularyElement":{"attribute":[68000012345,"FDA_NDC_11","My Test Drug","My Pharma LLC","PILL","100mg",500]}}},{"VocabularyElementList":{"VocabularyElement":{"attribute":["My Pharma LLC","3575 Zumstein Ave","Suite 101","Washington","DC","12345-6789","US"]}}}]}}}},"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-08-28T00:28:08.717Z","eventTimeZoneOffset":"-05:00","epcList":{"epc":["urn:epc:id:sgtin:036800.0012345.10000000001","urn:epc:id:sgtin:036800.0012345.10000000002","urn:epc:id:sgtin:036800.0012345.10000000003","urn:epc:id:sgtin:036800.1012345.22222222222"]},"action":"ADD","bizStep":"urn:epcglobal:cbv:bizstep:commissioning","disposition":"urn:epcglobal:cbv:disp:active","readPoint":{"id":"urn:epc:id:sgln:036800.111111.0"},"bizLocation":{"id":"urn:epc:id:sgln:036800.111111.0"},"extension":{"ilmd":{"lotNumber":"LOT123","itemExpirationDate":"2020-12-31"}}}}}}}'
        };

        pool.query.mockRejectedValueOnce(new Error("bad query")).mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith(1, "Error retrieving the routing rules for organization from routing rules service for event with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
        expect(reportError).toHaveLastReturnedWith("Unable to update event with id 12345-12345-12345 to failed status in database");
    });

    test('test message with no routing rules update event destination fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISHeader":{"StandardBusinessDocumentHeader":{"HeaderVersion":1,"Sender":{"Identifier":"urn:epc:id:sgln:036800.111111.0"},"Receiver":{"Identifier":"urn:epc:id:sgln:0716163.01122.0"},"DocumentIdentification":{"Standard":"EPCglobal","TypeVersion":1,"InstanceIdentifier":1234567890,"Type":"Events","CreationDateAndTime":"2020-08-28T12:10:16Z"}},"extension":{"EPCISMasterData":{"VocabularyList":{"Vocabulary":[{"VocabularyElementList":{"VocabularyElement":{"attribute":[68000012345,"FDA_NDC_11","My Test Drug","My Pharma LLC","PILL","100mg",500]}}},{"VocabularyElementList":{"VocabularyElement":{"attribute":["My Pharma LLC","3575 Zumstein Ave","Suite 101","Washington","DC","12345-6789","US"]}}}]}}}},"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-08-28T00:28:08.717Z","eventTimeZoneOffset":"-05:00","epcList":{"epc":["urn:epc:id:sgtin:036800.0012345.10000000001","urn:epc:id:sgtin:036800.0012345.10000000002","urn:epc:id:sgtin:036800.0012345.10000000003","urn:epc:id:sgtin:036800.1012345.22222222222"]},"action":"ADD","bizStep":"urn:epcglobal:cbv:bizstep:commissioning","disposition":"urn:epcglobal:cbv:disp:active","readPoint":{"id":"urn:epc:id:sgln:036800.111111.0"},"bizLocation":{"id":"urn:epc:id:sgln:036800.111111.0"},"extension":{"ilmd":{"lotNumber":"LOT123","itemExpirationDate":"2020-12-31"}}}}}}}'
        };

        pool.query.mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1}).mockRejectedValueOnce(new Error("bad query"));

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith(1, "Error retrieving the routing rules for organization from routing rules service for event with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
        expect(reportError).toHaveLastReturnedWith("Unable to update event destination with id 12345-12345-12345 to failed status in database");
    });

    test('test message with no routing rules update search service fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISHeader":{"StandardBusinessDocumentHeader":{"HeaderVersion":1,"Sender":{"Identifier":"urn:epc:id:sgln:036800.111111.0"},"Receiver":{"Identifier":"urn:epc:id:sgln:0716163.01122.0"},"DocumentIdentification":{"Standard":"EPCglobal","TypeVersion":1,"InstanceIdentifier":1234567890,"Type":"Events","CreationDateAndTime":"2020-08-28T12:10:16Z"}},"extension":{"EPCISMasterData":{"VocabularyList":{"Vocabulary":[{"VocabularyElementList":{"VocabularyElement":{"attribute":[68000012345,"FDA_NDC_11","My Test Drug","My Pharma LLC","PILL","100mg",500]}}},{"VocabularyElementList":{"VocabularyElement":{"attribute":["My Pharma LLC","3575 Zumstein Ave","Suite 101","Washington","DC","12345-6789","US"]}}}]}}}},"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-08-28T00:28:08.717Z","eventTimeZoneOffset":"-05:00","epcList":{"epc":["urn:epc:id:sgtin:036800.0012345.10000000001","urn:epc:id:sgtin:036800.0012345.10000000002","urn:epc:id:sgtin:036800.0012345.10000000003","urn:epc:id:sgtin:036800.1012345.22222222222"]},"action":"ADD","bizStep":"urn:epcglobal:cbv:bizstep:commissioning","disposition":"urn:epcglobal:cbv:disp:active","readPoint":{"id":"urn:epc:id:sgln:036800.111111.0"},"bizLocation":{"id":"urn:epc:id:sgln:036800.111111.0"},"extension":{"ilmd":{"lotNumber":"LOT123","itemExpirationDate":"2020-12-31"}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(500, {success:false, message:"blah"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith(1, "Error retrieving the routing rules for organization from routing rules service for event with ID 12345-12345-12345. Error: No Routing Rules processed for organization");
        expect(reportError).toHaveLastReturnedWith("Unable to update event with id 12345-12345-12345 to failed status in search service");
    });

    test('test message with routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {
                "id": 74,
                "organization_id": 1,
                "data_field": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "9999555*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/event").reply(200, {success:true, message:"processed"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(0);
    });

    test('test message with no matching routing rules', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {
                "id": 74,
                "organization_id": 1,
                "data_field": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "00000*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/event").reply(200, {success:true, message:"processed"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toHaveReturnedWith( "Unable to determine a route for event with ID 12345-12345-12345 based on current routing rules");
    });

    test('test message with routing rules adapter fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {
                "id": 74,
                "organization_id": 1,
                "data_field": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "9999555*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/event").reply(500, {success:false, message:"bork!"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(1);
        expect(reportError).toHaveReturnedWith( "Failed to process event with id 12345-12345-12345 to the required destination Blockchain adapter: mock-adapter");
    });

    test('test message with routing rules adapter fails and database fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
        };

        pool.query.mockRejectedValueOnce(new Error("bad query"))
        .mockRejectedValueOnce(new Error("bad query"))

        let mock = new MockAdapter(axios);
        let rules = [
            {
                "id": 74,
                "organization_id": 1,
                "data_field": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "9999555*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(200, []);
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/event").reply(500, {success:false, message:"bork!"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(3);
        expect(reportError).toHaveNthReturnedWith( 1, "Failed to process event with id 12345-12345-12345 to the required destination Blockchain adapter: mock-adapter");
        expect(reportError).toHaveNthReturnedWith( 2, "Unable to get the display name of the adapter service name mock-adapter from the database for event id 12345-12345-12345");
        expect(reportError).toHaveLastReturnedWith("Unable to update event with id 12345-12345-12345 to failed status in database");
    });

    test('test message with routing rules adapter fails and search service fails', async () => {
        let msg = {
            properties:{
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers:{
                    event_id: "12345-12345-12345",
                    client_id: "678901-678901-678901",
                    organization_id: 1
                }
            },
            content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});

        let mock = new MockAdapter(axios);
        let rules = [
            {
                "id": 74,
                "organization_id": 1,
                "data_field": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc",
                "datafield_prefix": "urn:epc:id:sgtin:",
                "comparator": 3,
                "comparator_operation": "isLike",
                "comparator_display": "is like (wildcard *)",
                "value": "9999555*",
                "destinations": [
                    "mock-adapter"
                ],
                "order": 1
            }
        ];
        mock.onGet(process.env.ROUTING_RULES_SERVICE + "/organization/1/routingrules").reply(200, rules);
        mock.onPatch(process.env.SEARCH_SERVICE + "/search/organizations/1/events/12345-12345-12345").reply(500, {success:false, message:"bork!"});
        mock.onPost(process.env.ALERT_SERVICE + "/organization/1/alerts").reply(200, []);
        mock.onPost("http://mock-adapter:8080/adapter/event").reply(500, {success:false, message:"bork!"});

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.processEvent(msg);

        expect(reportError).toBeCalledTimes(2);
        expect(reportError).toHaveNthReturnedWith( 1, "Failed to process event with id 12345-12345-12345 to the required destination Blockchain adapter: mock-adapter");
        expect(reportError).toHaveLastReturnedWith("Unable to update event with id 12345-12345-12345 to failed status in search service");
    });

});
