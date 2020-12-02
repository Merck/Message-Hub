/*
 * Copyright 2020 Merck Sharp & Dohme Corp. a subsidiary of Merck & Co.,
 * Inc., Kenilworth, NJ, USA.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * EPCIS MESSAGING HUB - MASTERDATA PROCESSOR

 */

import { CommonUtils } from "../utils/common-utils";
import axios from "axios";
import { PostgresService } from "../services/postgres-service"
import { RoutingRulesProcessor } from "../rules/routing-rules-processor"
import { ServiceError } from "../errors/service-error";
import { ErrorService } from '../services/error-service'
let amqp = require('amqplib/callback_api');
let commonUtils = new CommonUtils();

/**
 * This class is responsible for connecting to the configured RabbitMQ queue
 * and listening for master data.
 */
export class RabbitMQProcessor {

    private _postgresService: PostgresService = new PostgresService();
    private _routingRulesProcessor: RoutingRulesProcessor = new RoutingRulesProcessor();

    /**
     * Processor constructor
     */
    constructor() {
    }

    /**
     * Starts the queue processor by creating the connection to RabbitMQ
     * and begin listening on the channel
     */
    public async start() {
        let conn: any;
        try {
            conn = await this.amqpConnection();
            this.subscribe(conn);
        } catch (err) {
            this.handleAmqpError(err, this.start.bind(this));
        }

    }

    /**
     * Creates a AMQP connection
     */
    private async amqpConnection() {
        return new Promise((resolve, reject) => {
            amqp.connect({
                protocol: process.env.RABBITMQ_PROTOCOL,
                hostname: process.env.RABBITMQ_HOST,
                port: process.env.RABBITMQ_PORT,
                username: process.env.RABBITMQ_USER,
                password: process.env.RABBITMQ_PASSWORD,
                ca: commonUtils.decodeBase64((process.env.RABBITMQ_CERT as unknown) as string)
            }, function (err: any, conn: any) {
                if (err) {
                    ErrorService.reportError(null, null, 4005, err.stack, null);
                    reject(new ServiceError(err, 4005));
                }
                resolve(conn);
            });
        });
    }

    /**
     * Creates a AMQP connection
     * @param conn
     */
    private async subscribe(conn: any) {
        return new Promise((resolve, reject) => {
            conn.createChannel((err: any, ch: any) => {
                if (err) {
                    ErrorService.reportError(null, null, 4006, err.stack, null);
                    reject(new ServiceError(err, 4006));
                }
                // set exchange that is being used
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_EXCHANGE, 'direct', { durable: true });
    
                // set dl exchange that is being used
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE, 'fanout', { durable: true });
    
                // set dl queue that is being used
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_DEADLETTER_QUEUE, {
                    durable: true,
                    autoAck: false,
                    noAck: false
                }, (err: any, q: any) => {
                    if (err) {
                        ErrorService.reportError(null, null, 4007, err.stack, null);
                        reject(new ServiceError(err, 4007));
                    }
                    // bind the dead letter queue to the dead letter exchange
                    ch.bindQueue(q.queue, process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE, "#");
                });
    
                // set queue that is being used
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_QUEUE, {
                    durable: true,
                    deadLetterExchange: process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE
                }, (err: any, q: any) => {
                    if (err) {
                        ErrorService.reportError(null, null, 4008, err.stack, null);
                        reject(new ServiceError(err, 4008));
                    }
                    // bind the queue to the exchange
                    ch.bindQueue(q.queue, process.env.RABBITMQ_MASTERDATA_EXCHANGE, "#");
                    // consume from the queue, one message at a time.
                    ch.consume(q.queue, (msg: any) => {
                        //do something with the message
                        this.processMasterdata(msg).then((success: boolean) => {
                            if (success) {
                                //acknowledge it
                                ch.ack(msg, false);
                            } else {
                                //reject it
                                // the 'false' param at the very end means, don't retry! dead letter this instead!
                                ch.nack(msg, false, false);
                            }
                        });
                    }, { noAck: false });
                });
            });
        });
    }

    /**
     * Process the incoming master data
     *
     * @param msg
     * @public
     */
    public processMasterdata = async (msg: any): Promise<boolean> => {

        let contentType = msg.properties.contentType;
        let contentEncoding = msg.properties.contentEncoding;
        let masterdataId = msg.properties.headers.masterdata_id;
        let clientId = msg.properties.headers.client_id;
        let organizationId = msg.properties.headers.organization_id;
        let failed = false;

        if (!organizationId) {
            ErrorService.reportError(organizationId, clientId, 1005, null, clientId);
            return false;
        }

        if (!contentType) {
            ErrorService.reportError(organizationId, clientId, 1001, null, null);
        }

        if (!contentEncoding) {
            ErrorService.reportError(organizationId, clientId, 1002, null, null);
        }

        if (!masterdataId) {
            ErrorService.reportError(organizationId, clientId, 1003, null, null);
            return false;
        }

        if (!clientId) {
            ErrorService.reportError(organizationId, clientId, 1004, null, null);
            return false;
        }

        let message;
        if (!msg.content) {
            ErrorService.reportError(organizationId, clientId, 1006, null, clientId);
            return false;
        } else {
            message = msg.content.toString();
            if (!message || message === '') {
                ErrorService.reportError(organizationId, clientId, 1007, null, clientId);
                return false;
            }
        }

        let adapters;
        let json;
        try {
            json = JSON.parse(message);
            adapters = await this._routingRulesProcessor.determineDestination(json, organizationId);
        } catch (error) {
            if (error instanceof ServiceError) {
                ErrorService.reportError(organizationId, clientId, error.errorCode, error.stack, [masterdataId, error.message]);
            } else {
                ErrorService.reportError(organizationId, clientId, 9000, error.stack, [masterdataId, error.message]);
            }
            //update postgres
            this._postgresService.updateMasterdata(masterdataId, "failed").catch(e => {
                ErrorService.reportError(organizationId, clientId, 4003, e.stack, masterdataId);
            });
            this._postgresService.updateMasterdataDestination(masterdataId, "failed", 'No routing rules match the master data', 'No Route Found').catch(e => {
                ErrorService.reportError(organizationId, clientId, 4004, e.stack, masterdataId);
            });

            return false; // put in dead letter Q
        }

        let body = {
            masterdataid: masterdataId,
            organizationid: organizationId,
            json: json
        }

        //for each adapter send the json to it
        for (let i = 0; i < adapters.length; i++) {
            let serviceName = adapters[i];
            try {
                let serviceURI;

                //determine if running locally and env exists
                let envname = serviceName.toUpperCase().split('-').join('_') + "_SERVICE";
                if (process.env[envname]) {
                    serviceURI = process.env[envname];
                } else {
                    serviceURI = "http://" + serviceName + ":8080";
                }

                await axios.post(serviceURI + "/adapter/masterdata", body);
            } catch (error) {
                failed = true;
                ErrorService.reportError(organizationId, clientId, 4002, error.stack, [masterdataId, serviceName]);
                let displayName;
                await this._postgresService.getDisplayNameOfAdapter(serviceName).then(result => {
                    if (result.rowCount > 0)
                        displayName = result.rows[0].display_name;
                }).catch(e => {
                    ErrorService.reportError(organizationId, clientId, 4010, e.stack, [serviceName, masterdataId]);
                });
                if (displayName === undefined)
                    displayName = serviceName;
 
                this._postgresService.updateMasterdata(masterdataId, "failed").catch(e => {
                    ErrorService.reportError(organizationId, clientId, 4003, e.stack, masterdataId);
                });
                /*this._postgresService.updateMasterdataDestination(masterdataId, "failed", error.message, displayName).catch(e => {
                    ErrorService.reportError(organizationId, clientId, 4004, e.stack, masterdataId);
                });*/
            }
        }
        return !failed;
    }

    /**
     * Handle error to reconnect to Rabbitmq again.
     *
     * @param error
     * @param callback
     * @public
     */
    public handleAmqpError(error: any, callback: Function): void {
        if (error instanceof ServiceError) {
            ErrorService.reportError(null, null, 2010, error.stack, null);
            setTimeout(() => callback(), 60000);
        }
    }
}