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
 * EPCIS MESSAGING HUB - ADMINISTRATION BFF

 */

require("dotenv").config();
import {RouterController} from "./controller/router-controller";
import {AdministrationController} from "./controller/administration-controller";
import {AdministrationAlertsController} from "./controller/administration-alerts-controller";
import {AdministrationEventsController} from "./controller/administration-events-controller";
import {AdministrationMasterdataController} from "./controller/administration-masterdata-controller";
import {AdministrationOrganizationController} from "./controller/administration-organization-controller";
import {AdministrationOrganizationUsersController} from "./controller/administration-organization-users-controller";
import {AdministrationPrivacyRulesController} from "./controller/administration-privacy-rules-controller";
import {AdministrationRoutingRulesController} from "./controller/administration-routing-rules-controller";
import {AdministrationUsersController} from "./controller/administration-users-controller";
import {AdministrationMetricsController} from "./controller/administration-metrics-controller";
import {HealthCheckController} from "./controller/healthcheck-controller";

/**
 * Main entry point for the service
 */
const routerController = new RouterController([
    new AdministrationController(),
    new AdministrationUsersController(),
    new AdministrationEventsController(),
    new AdministrationOrganizationController(),
    new AdministrationOrganizationUsersController(),
    new AdministrationMasterdataController(),
    new AdministrationRoutingRulesController(),
    new AdministrationPrivacyRulesController(),
    new AdministrationAlertsController(),
    new AdministrationMetricsController(),
    new HealthCheckController(),
], (process.env.ADMIN_BFF_LOCAL_PORT as unknown) as number || 8080);

routerController.listen();