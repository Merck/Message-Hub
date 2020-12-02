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
 * EPCIS MESSAGING HUB - ROUTING RULES SERVICE

 */

require("dotenv").config();
import {RouterController} from "./controller/router-controller";
import {RoutingRulesController} from "./controller/routing-rules-controller";
import {HealthCheckController} from "./controller/healthcheck-controller";

/**
 * Main entry point for the service
 */
const routerController = new RouterController([
    new RoutingRulesController(), new HealthCheckController(),
], (process.env.ROUTING_RULES_SERVICE_LOCAL_PORT as unknown) as number || 8080);

routerController.listen();