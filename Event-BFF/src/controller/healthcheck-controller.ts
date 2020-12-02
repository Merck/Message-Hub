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
 * EPCIS MESSAGING HUB - EVENT BFF

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
         * /events/health:
         *   get:
         *     description: Gets the current health of the service
         *     tags: ["Healthcheck API"]
         *     produces:
         *       - application/json
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
         *       503:
         *         description: DOWN (NOT OK) response
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: "DOWN"
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
        try {
            await axios.get(process.env.EVENT_SERVICE + '/health')
                .then((response) => {
                    componentstatus.push({"event-service": response.data});
                }, (error) => {
                    up = false;
                    if (error.code) {
                        componentstatus.push({"event-service": {status: error.code}});
                    } else {
                        componentstatus.push({"event-service": error.response.data});
                    }
                });

            res.status(200).send({"status": up ? "UP" : "DOWN", "components": componentstatus});

        } catch (error) {
            logger.error(error);
            res.status(200).send({"status": "UNKNOWN"});
        }
        return true;
    }
}