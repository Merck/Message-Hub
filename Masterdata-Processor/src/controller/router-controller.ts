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

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import {IRoutingController} from "../interfaces/routing-controller"
import {CommonUtils} from "../utils/common-utils";

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));
let rawBodyParserOptions = {inflate: true, limit: '100mb', type: 'application/xml'};

/**
 * The Router Controller for the service
 */
export class RouterController {
    public service: express.Application;
    public port: number;

    /**
     * Router constructor. Initializes middleware and controllers
     *
     * @param controllers - list of controllers used by the service
     * @param port - the port number for the service to use. Defaults to 8080
     */
    constructor(controllers: IRoutingController[], port?: number) {
        this.port = port || 8080;
        this.service = express();
        this.initMiddleware();
        this.initControllers(controllers);
    };

    /**
     * Initializes any required middleware
     */
    private initMiddleware = (): void => {
        this.service.disable('x-powered-by');
        this.service.use(express.json());
        this.service.use(express.urlencoded({extended: false}));
        this.service.use(bodyParser.raw(rawBodyParserOptions));
        this.service.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, x-auth");
            next();
        });
    };

    /**
     * Initializes all of the controllers under the specified route
     *
     * @param controllers
     */
    private initControllers = (controllers: IRoutingController[]): void => {
        controllers.forEach((controller: IRoutingController) => {
            this.service.use('/', controller.router);
        });
    };

    /**
     * Starts the service listening on the specified port.
     */
    public listen() {
        this.service.listen(this.port, () => {
            logger.info(`Master data Processor started on PORT : [ ${this.port} ]`);
        })
    }
}