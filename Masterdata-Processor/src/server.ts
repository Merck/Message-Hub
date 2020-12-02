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
 * EPCIS MESSAGING HUB - MASTER DATA PROCESSOR

 */

require("dotenv").config();
import {RouterController} from "./controller/router-controller";
import {HealthCheckController} from "./controller/healthcheck-controller";
import {RabbitMQProcessor} from "./processor/rabbit-mq-processor";


/** allow our services to use the self-signed certificates
 provided by the ibm cloud services **/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Main entry point for the service
 */
const routerController = new RouterController([new HealthCheckController()],
    (process.env.MASTERDATA_PROCESSOR_LOCAL_PORT as unknown) as number || 8080);

const masterDataProcessor = new RabbitMQProcessor();

routerController.listen();
masterDataProcessor.start();