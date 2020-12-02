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
 * EPCIS MESSAGING HUB - EVENT PROCESSOR
 */

import express from "express";

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
        this.router.get("/health", this.getHealth);
    }

    /**
     * Checks the health of any service dependencies and returns the overall health of the service
     *
     * @param req - the incoming request
     * @param res - the outgoing response
     */
    getHealth = async (req: express.Request, res: express.Response): Promise<boolean> => {
        res.send({"status": "UP"});
        return false;
    }
}
