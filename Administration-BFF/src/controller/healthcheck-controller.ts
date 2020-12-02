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

import express from "express";
import path from "path";
import axios from "axios";

import {CommonUtils} from "../utils/common-utils";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This class implement a controller for the /heath endpoint to be used by
 * Kubernetes to determine the status of the service.
 */
export class HealthCheckController {

    public router = express.Router();

    /**
     * Service constructor.  Exposes the API endpoint
     */
    constructor() {
        /**
         * @swagger
         *
         * /admin/health:
         *   get:
         *     description: Gets the current health of the service
         *     produces: [application/json]
         *     tags: ["Healthcheck API"]
         *     responses:
         *       200:
         *         description: UP (OK) response
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: "UP"
         *       403:
         *         description: "Valid JWT Bearer token required in Authentication header"
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/403Response'
         */
        this.router.get("/health", this.getHealth);
    }

    /**
     * Checks the health of any service dependencies and returns the overall health of the service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getHealth = async (req: express.Request, res: express.Response): Promise<boolean> => {

        let componentstatus: any = [];
        let up = true;
        let services = [
            {name: "organization-service", uri: process.env.ORGANIZATION_SERVICE},
            {name: "event-service", uri: process.env.EVENT_SERVICE},
            {name: "search-service", uri: process.env.SEARCH_SERVICE},
            {name: "routing-rules-service", uri: process.env.ROUTING_RULES_SERVICE},
            {name: "data-privacy-rules-service", uri: process.env.DATA_PRIVACY_RULES_SERVICE},
            {name: "masterdata-service", uri: process.env.MASTERDATA_SERVICE},
            {name: "metrics-service", uri: process.env.METRICS_SERVICE},
            {name: "alert-service", uri: process.env.ALERT_SERVICE}
        ];

        for (let i = 0; i < services.length; i++) {
            let service = services[i];
            try {
                //call the event-service health endpoint
                await axios.get(service.uri + '/health')
                    .then((response) => {
                        let obj: any = {};
                        obj.service_name = service.name;
                        obj.status = response.data.status;
                        componentstatus.push(obj);
                    }, (error) => {
                        up = false;
                        if (error.code) {
                            let obj: any = {};
                            obj.service_name = service.name;
                            obj.status = error.code;
                            componentstatus.push(obj);
                        } else {
                            let obj: any = {};
                            obj.service_name = service.name;
                            const errResponse = error.response.data;
                            if (errResponse.status)
                                obj.status = errResponse.status;
                            else
                                obj.status = errResponse;
                            componentstatus.push(obj);
                        }
                    }
                );
            } catch (error) {
                logger.error("|ADM0000|" + error);
                let obj: any = {};
                obj.service_name = service.name;
                obj.status = "UNKNOWN";
                componentstatus.push(obj);
            }
        }

        //return the overall health
        res.status(200).send({"status": up ? "UP" : "DOWN", "components": componentstatus});

        return true;
    }
}