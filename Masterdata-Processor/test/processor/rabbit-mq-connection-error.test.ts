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
        createChannel: jest.fn((callback: any) => callback(new Error(), mChannel))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(new Error(), mConn))
    };
});

describe("Check class \'RabbitMQProcessor\' for rabbit mq connection error ", () => {

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
    
    test('test rabbit mq connection  and channel, return error', async () => {

        let reportError = jest.spyOn(ErrorService, 'reportError');

        await processor.start();

        expect(reportError).toBeCalledTimes(2);
    });
});