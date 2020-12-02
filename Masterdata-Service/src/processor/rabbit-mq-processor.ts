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
 * EPCIS MESSAGING HUB - MASTER DATA SERVICE

 */

import { CommonUtils } from "../utils/common-utils";
import { ErrorService } from '../services/error-service'
import { ServiceError } from "../errors/service-error";
import { PostgresService } from "../services/postgres-service";

let amqp = require('amqplib/callback_api');
let commonUtils = new CommonUtils();

let pubChannel: any = undefined;

/**
 * This class is responsible for connecting to the configured RabbitMQ queue
 * and publishing the masterdata.
 */
export class RabbitMQProcessor {

    private _postgresService: PostgresService = new PostgresService();
    /**
     * Processor constructor
     */
    constructor() {
    }

    /**
     * Starts the queue processor by creating the connection to RabbitMQ
     */
    public async start() {
        let conn: any;
        try {
            conn = await this.amqpConnection();
            await this.amqpChannel(conn);
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
                    ErrorService.reportError(null, null, 4008, err.stack, null);
                    reject(new ServiceError(err, 4008));
                }
                resolve(conn);
            });
        });
    }

    /**
     * Creates a AMQP channel
     * @param conn
     */
    private async amqpChannel(conn: any) {
        return new Promise((resolve, reject) => {
            //connect to the configured channel
            conn.createConfirmChannel(function (err: any, ch: any) {
                if (err) {
                    ErrorService.reportError(null, null, 4009, err.stack, null);
                    conn.close();
                    reject(new ServiceError(err, 4009));
                }

                ch.on("error", function (err: any) {
                    ErrorService.reportError(null, null, 4010, err.stack, null);
                    reject(new ServiceError(err, 4010));
                });

                ch.on("close", function () {
                    ErrorService.reportError(null, null, 4011, null, null);
                    reject(new ServiceError(new Error('RabbitMQ channel closed unexpectedly.'), 4011));
                });

                pubChannel = ch;
            });
        });
    }

    /**
     * Publishes a master data to the queue
     *
     * @param content - the JSON formatted masterdata message to be put on the queue
     * @param masterdataId - the masterdata id for the masterdata
     * @param clientId - the client id (service credentials) that called the hub api
     * @param orgId - the organization id the the client id belongs to
     */
    public async publishMasterdata(content: string, masterdataId: string, clientId: string, orgId: number) {
        try {
            //generate the message headers
            let options = {
                persistent: true,
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers: {
                    masterdata_id: masterdataId,
                    client_id: clientId,
                    organization_id: orgId
                }
            };
            await pubChannel.publish(process.env.RABBITMQ_MASTERDATA_EXCHANGE, "#", Buffer.from(content), options, (err: any, ok: any) => {
                if (err) {
                    pubChannel.connection.close();
                    this.handleAmqpError(new ServiceError(err, 4012), this.start.bind(this));
                    throw new ServiceError(err, 4012);
                }
            });
            return true;
        } catch (err) {
            this.handleAmqpError(new ServiceError(err, 4013), this.start.bind(this));
            throw new ServiceError(err, 4013);
        }
    }

    /**
     * Publish the masterdata to holding queue if the processing is paused.
     * @param content - the JSON formatted masterdata message to be put on the queue
     * @param masterdataId - the masterdata id for the masterdata
     * @param clientId - the client id (service credentials) that called the hub api
     * @param orgId - the organization id the the client id belongs to
     */
    public async publishMasterdataHoldingQueue(content: string, masterdataId: string, clientId: string, orgId: number) {
        return new Promise(async (resolve, reject) => {
            let connection: any;
            //generate the message headers
            let options = {
                persistent: true,
                contentType: "application/json",
                contentEncoding: "UTF-8",
                headers: {
                    masterdata_id: masterdataId,
                    client_id: clientId,
                    organization_id: orgId
                }
            };
            try {
                connection = await this.amqpConnection();
            } catch (err) {
                reject(err);
            }
            connection.createChannel((err: any, ch: any) => {
                if (err) {
                    ch.connection.close();
                    reject(new ServiceError(err, 4009));
                }
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_HOLDING_EXCHANGE, 'direct', { durable: true });
                // set queue that is being used
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_HOLDING_QUEUE, { durable: true }, (err: any, q: any) => {
                    if (err) {
                        ch.connection.close();
                        reject(new ServiceError(err, 4016));
                    }
                    ch.bindQueue(q.queue, process.env.RABBITMQ_MASTERDATA_HOLDING_EXCHANGE, "#");
                    ch.publish(process.env.RABBITMQ_MASTERDATA_HOLDING_EXCHANGE, "#", Buffer.from(content), options, (err: any, ok: any) => {
                        if (err) {
                            ch.connection.close();
                            reject(new ServiceError(err, 4012));
                        }
                    });
                });
                resolve(true)
            });
        });
    }

    /**
     * Consume the masterdata mesages from holding queue and publish it to processing queue if the processing is resumed.
     * 
     */
    public async consumeMasterdataHoldingQueue() {
        return new Promise(async (resolve, reject) => {
            let connection: any;
            try {
                connection = await this.amqpConnection();
            } catch (err) {
                reject(err);
            }
            connection.createChannel((err: any, ch: any) => {
                if (err) {
                    ch.connection.close();
                    reject(new ServiceError(err, 4009));
                }
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_HOLDING_EXCHANGE, 'direct', { durable: true });
                // set queue that is being used
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_HOLDING_QUEUE, {
                    durable: true,
                }, (err: any, q: any) => {
                    if (err) {
                        ch.connection.close()
                        reject(new ServiceError(err, 4016));
                    }
                    if (q.queue && q.messageCount > 0) {
                        // bind the queue to the exchange
                        ch.prefetch(1);
                        ch.bindQueue(q.queue, process.env.RABBITMQ_MASTERDATA_HOLDING_EXCHANGE, "#");
                        // consume from the queue, one message at a time.
                        ch.consume(q.queue, (msg: any) => {
                            //publish the message
                            const masterdataMsg = msg.content.toString();
                            const masterdata_id = msg.properties.headers.masterdata_id;
                            const clientId = msg.properties.headers.client_id;
                            const organizationId = msg.properties.headers.organization_id;

                            this.publishMasterdata(masterdataMsg, masterdata_id, clientId, organizationId).then(async (success) => {
                                //acknowledge it
                                ch.ack(msg, true);
                                if (q.messageCount === msg.fields.deliveryTag && masterdata_id === msg.properties.headers.masterdata_id) {
                                    await new Promise(resolve => setTimeout(resolve, 10000));
                                    ch.connection.close()
                                }
                            }).catch(async (err) => {
                                ch.nack(msg, true, true);
                                await new Promise(resolve => setTimeout(resolve, 10000));
                                ch.connection.close();
                            });
                        }, { noAck: false });
                    } else {
                        ch.connection.close();
                    }
                });
            });
        });
    }

    /**
     * Gets the count of messages processing in Masterdata queue
     *
     */
    public async getMasterdataQueueMessagesCount() {
        return new Promise((resolve, reject) => {
            if (pubChannel === undefined) {
                this.handleAmqpError(new ServiceError(new Error(), 4010), this.start.bind(this));
                reject(new ServiceError(new Error(), 4010));
            }
            try {
                pubChannel.assertQueue(process.env.RABBITMQ_MASTERDATA_QUEUE, { durable: true, deadLetterExchange: process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE }, (err: any, ok: any) => {
                    if (err) {
                        this.handleAmqpError(new ServiceError(err, 4014), this.start.bind(this));
                        reject(new ServiceError(err, 4014));
                    }
                    resolve(ok);
                });
            } catch (err) {
                this.handleAmqpError(new ServiceError(err, 4014), this.start.bind(this));
                reject(new ServiceError(err, 4014));
            }
        });
    }

    /**
     * Gets the count of messages processing in Masterdata holding queue
     *
     */
    public async getMasterdataHoldingQueueMessagesCount() {
        return new Promise(async (resolve, reject) => {
            let connection: any;
            try {
                connection = await this.amqpConnection();
            } catch (err) {
                throw err;
            }
            connection.createChannel((err: any, ch: any) => {
                if (err) {
                    ch.connection.close();
                    reject(new ServiceError(err, 4009));
                }
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_HOLDING_QUEUE, { durable: true }, (err: any, ok: any) => {
                    if (err) {
                        ch.connection.close();
                        reject(new ServiceError(err, 4014));
                    }
                    ch.connection.close();
                    resolve(ok);
                });
            })
        });
    }

    /**
     * Gets the count of messages processing in Masterdata DLX queue
     *
     */
    public async getMasterdataDLXQueueMessagesCount() {
        return new Promise(async (resolve, reject) => {
            let connection: any;
            try {
                connection = await this.amqpConnection();
            } catch (err) {
                throw err;
            }
            connection.createChannel((err: any, ch: any) => {
                if (err) {
                    ch.connection.close();
                    reject(new ServiceError(err, 4009));
                }
                // set dl exchange that is being used
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE, 'fanout', { durable: true });
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_DEADLETTER_QUEUE, { durable: true }, (err: any, ok: any) => {
                    if (err) {
                        ch.connection.close();
                        reject(new ServiceError(err, 4015));
                    }
                    ch.connection.close();
                    resolve(ok);
                });
            })
        });
    }

    /**
     * Retry the failed masterdata messages in deadletter queue back to processing queue.
     * 
     * @param masterdata_paused - Flag to check if the processing queue status for masterdata is paused or not
     */
    public async retryMessagesFromDLX(masterdata_paused: boolean) {
        return new Promise(async (resolve, reject) => {
            let connection: any;
            try {
                connection = await this.amqpConnection();
            } catch (err) {
                throw err;
            }
            connection.createChannel((err: any, ch: any) => {
                if (err) {
                    ch.connection.close();
                    reject(new ServiceError(err, 4009));
                }
                // set dl exchange that is being used
                ch.assertExchange(process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE, 'fanout', { durable: true });

                // set dl queue that is being used
                ch.assertQueue(process.env.RABBITMQ_MASTERDATA_DEADLETTER_QUEUE, {
                    durable: true
                }, (err: any, q: any) => {
                    // bind the dead letter queue to the dead letter exchange
                    if (err) {
                        ch.connection.close();
                        reject(new ServiceError(err, 4015));
                    }
                    if (q.queue && q.messageCount > 0) {
                        ch.bindQueue(q.queue, process.env.RABBITMQ_MASTERDATA_DEADLETTER_EXCHANGE, "#");
                        // consume from the queue, one message at a time.
                        ch.consume(q.queue, (msg: any) => {
                            //publish the message
                            const masterdataMsg = msg.content.toString();
                            const masterdata_id = msg.properties.headers.masterdata_id;
                            const clientId = msg.properties.headers.client_id;
                            const organizationId = msg.properties.headers.organization_id;

                            if (masterdata_paused) {
                                this.publishMasterdataHoldingQueue(masterdataMsg, masterdata_id, clientId, organizationId).then(async () => {
                                    //ch.ack(msg, true);
                                    await this._postgresService.updateMasterdataStatus(masterdata_id, "processing").catch((err) => {
                                        ErrorService.reportError(organizationId, clientId, 4019, err.stack, masterdata_id);
                                    });
                                    // Check if the count reaches the current max count of the messages. Close the connection
                                    if (q.messageCount === msg.fields.deliveryTag) {
                                        ch.connection.close();
                                        resolve({ success: true, message: 'Success in retrying the failed masterdata messages.' });
                                    }
                                }).catch((err) => {
                                    //ch.nack(msg, true, true);
                                    if (q.messageCount === msg.fields.deliveryTag) {
                                        ch.connection.close();
                                    }
                                    reject(new ServiceError(err, 4012));
                                })
                            } else {
                                this.publishMasterdata(masterdataMsg, masterdata_id, clientId, organizationId).then(() => {
                                    //ch.ack(msg, true);
                                    // Check if the count reaches the current max count of the messages. Close the connection
                                    if (q.messageCount === msg.fields.deliveryTag) {
                                        ch.connection.close();
                                        resolve({ success: true, message: 'Success in retrying the failed masterdata messages.' });
                                    }
                                }).catch((err) => {
                                    //ch.nack(msg, true, true);
                                    if (q.messageCount === msg.fields.deliveryTag) {
                                        ch.connection.close();
                                    }
                                    reject(new ServiceError(err, 4012));
                                })
                            }
                        }, { noAck: true });
                    } else {
                        resolve({ success: false, message: 'No failed master data messages to retry.' });
                    }
                });
            });
        });
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
            ErrorService.reportError(null, null, 2010, error, null);
            setTimeout(() => callback(), 60000);
        }
    }
}