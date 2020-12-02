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

/**
 * This controller is responsible for serving the swagger.json file
 */
export class SwaggerController {

    public router = express.Router();
    private spec: any;

    /**
     * Controller constructor.  Exposes the API endpoints
     */
    constructor( swaggerSpec: any ) {
        this.spec = swaggerSpec;
        this.router.get("/",  this.returnSpec );
    }

    /**
     * Returns the swagger json spec file
     *
     * @param req
     * @param res
     */
    returnSpec = async (req: express.Request, res: express.Response): Promise<boolean> => {
        res.status(200).send(this.spec);
        return true;
    }
}