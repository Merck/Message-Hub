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
 * EPCIS MESSAGING HUB - BLOCKCHAIN LAB ADAPTER

 */

import express from "express";
import axios from "axios";
import {PostgresService} from "../services/postgres-service"
import {ErrorService} from "../services/error-service";
import {ServiceError} from "../errors/service-error";
import {CommonUtils} from "../utils/common-utils";

let commonUtils = new CommonUtils();
let jp = require('jsonpath');

export class AdapterController {

    public router = express.Router();
    private _postgresService: PostgresService = new PostgresService();
    private _destination = "Blockchain Lab";

    constructor() {
        this.router.post("/adapter/event", this.postEvent);
        this.router.get("/adapter/organization/:orgId/event/:eventId", this.getEvent);

        this.router.post("/adapter/masterdata", this.postMasterdata);
        this.router.get("/adapter/organization/:orgId/masterdata/:masterdataId", this.getMasterdata);
    }

    /**
     * Retrieves the event from the blockchain
     * @param req
     * @param res
     */
    getEvent = async (req: express.Request, res: express.Response): Promise<void> => {
        let eventId = req.params.eventId;
        let organizationId = parseInt(req.params.orgId);

        let token;

        await this.authenticateWithBlockchain(organizationId).then(result => {
            token = result;
        }).catch(error => {
            res.status(400).send({"success": false, "message": "Rejected. Reason: " + error.message});
        });

        const options = {
            headers: {
                'Authorization': "Bearer " + token
            }
        };

        await axios.get(process.env.DFP_BLOCKCHAIN_API + "/api/messageHub/eventXML/" + eventId, options).then(result => {
            res.status(200).send(result.data);
        }).catch(error => {
            res.status(error.response.status).send(error.response.data);
        });
    }

    /**
     * Handles the incoming message, adapting it for the specific blockchain
     *
     * @param req
     * @param res
     */
    postEvent = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let eventId;
        let organizationId;
        let status;

        try {
            if (!req.body) {
                throw new Error("Missing request body");
            }

            organizationId = req.body.organizationid;
            if (!organizationId) {
                throw new Error("Missing organization id");
            }

            eventId = req.body.eventid;
            if (!eventId) {
                throw new Error("Missing event id");
            }

            let json = req.body.json;
            if (!json) {
                throw new Error("Missing event data");
            }

            //INSERT BLOCKCHAIN SPECIFIC CODE HERE
            json.id = eventId;
            let bcResponse = await this.writeEventMessageToBlockchain(organizationId, json);

            //UPDATE THE STATUS IN POSTGRES
            status = "on_ledger";
            await this._postgresService.updateEventDestination(eventId, status, bcResponse);
            await this._postgresService.updateEventStatus(eventId, status);

            //UPDATE THE STATUS IN ELASTICSEARCH
            const body = {
                destination: this._destination,
                status: status
            };
            await axios.patch(process.env.SEARCH_SERVICE + "/search/organizations/" + organizationId + "/events/" + eventId, body);

            res.status(200).send({"success": true, "message": bcResponse});
        } catch (e) {
            if (e instanceof ServiceError) {
                ErrorService.reportError(organizationId, null, e.errorCode, e.stack, [eventId, e.message]);
            } else {
                ErrorService.reportError(organizationId, null, 3000, e.stack, [eventId, e.message]);
            }

            status = "failed";
            if (eventId) {
                await this._postgresService.updateEventDestination(eventId, status, '');
                await this._postgresService.updateEventStatus(eventId, status);
                if (organizationId) {
                    //UPDATE THE STATUS IN ELASTICSEARCH
                    const body = {
                        destination: this._destination,
                        status: status
                    };
                    await axios.patch(process.env.SEARCH_SERVICE + "/search/organizations/" + organizationId + "/events/" + eventId, body);
                }
            }
            res.status(400).send({"success": false, "message": "Rejected. Reason: " + e.message});
            return false;
        }

        return true;
    }

    /**
     * Writes a message to the Blockchain
     *
     * @param organizationId
     * @param message
     */
    private writeEventMessageToBlockchain = async (organizationId:number, message: any): Promise<any> => {
        let token;

        await this.authenticateWithBlockchain(organizationId).then(result => {
            token = result;
        }).catch(error => {
            throw error;
        });

        const options = {
            headers: {
                'Authorization': "Bearer " + token
            }
        };

        let bcResponse: any;
        await axios.post(process.env.DFP_BLOCKCHAIN_API + "/api/messageHub/eventXML", message, options).then(result => {
            bcResponse = result.data;
        }).catch(error => {
            console.log( JSON.stringify(error.response.data) );

            if( 401 === error.response.status){
                throw new ServiceError(error.response.data.message, 3001);
            }
            throw new ServiceError(error.response.data.message, 3000);
        });

        console.log("BC RESPONSE " + bcResponse.message);
        return bcResponse.message;
    }

    /**
     * Gets masterdata from the blockchain (not used in this implementation)
     * @param req
     * @param res
     */
    getMasterdata = async (req: express.Request, res: express.Response): Promise<void> => {
        let masterdataId = req.params.masterdataId;
        let organizationId = parseInt(req.params.orgId);

        let token;

        await this.authenticateWithBlockchain(organizationId).then(result => {
            token = result;
        }).catch(error => {
            res.status(400).send({"success": false, "message": "Rejected. Reason: " + error.message});
        });

        const options = {
            headers: {
                'Authorization': "Bearer " + token
            }
        };

        await axios.get(process.env.DFP_BLOCKCHAIN_API + "/api/messageHub/masterData/" + masterdataId, options).then(result => {
            res.status(200).send(result.data);
        }).catch(error => {
            res.status(error.response.status).send(error.response.data);
        });
    }

    /**
     * Posts masterdata to the blockchain (not used in this implementation)
     * @param req
     * @param res
     */
    postMasterdata = async (req: express.Request, res: express.Response): Promise<boolean> => {
        let masterdataId;
        let organizationId;
        let status;

        try {
            if( !req.body ){
                throw new Error("Missing request body");
            }

            organizationId = req.body.organizationid;
            if( !organizationId ){
                throw new Error("Missing organization id");
            }

            masterdataId = req.body.masterdataid;
            if( !masterdataId ){
                throw new Error("Missing masterdata id");
            }

            let json = req.body.json;
            if( !json ){
                throw new Error("Missing master data json");
            }

            //INSERT BLOCKCHAIN SPECIFIC CODE HERE
            json.id = masterdataId;
            let bcResponse = await this.writeMasterdataMessageToBlockchain(organizationId, json);

            //UPDATE THE STATUS IN POSTGRES
            status = "on_ledger";
            await this._postgresService.updateMasterdataDestination(masterdataId, status, bcResponse);
            await this._postgresService.updateMasterdata(masterdataId, status);

            res.status(200).send({"success": true, "message": bcResponse});
        } catch (e) {
            status = "failed";
            console.log("Adapter error " + e.stack);
            if( masterdataId ) {
                await this._postgresService.updateMasterdataDestination(masterdataId, status, '');
                await this._postgresService.updateMasterdata(masterdataId, status);
            }
            res.status(400).send({"success": false, "message": "Rejected. Reason: " + e.message});
            return false;
        }

        return true;
    }

    /**
     * Writes a message to the Blockchain
     *
     * @param organizationId
     * @param message
     */
    private writeMasterdataMessageToBlockchain = async (organizationId:number, message: any): Promise<any> => {
        let token;

        await this.authenticateWithBlockchain(organizationId).then(result => {
            token = result;
        }).catch(error => {
            throw error;
        });

        const options = {
            headers: {
                'Authorization': "Bearer " + token
            }
        };

        let bcResponse: any;
        await axios.post(process.env.DFP_BLOCKCHAIN_API + "/api/messageHub/masterData", message, options).then(result => {
            bcResponse = result.data;
        }).catch(error => {
            console.log( JSON.stringify(error.response.data) );

            if( 401 === error.response.status){
                throw new ServiceError(error.response.data.message, 3001);
            }
            throw new ServiceError(error.response.data.message, 3000);
        });

        console.log("BC RESPONSE " + bcResponse.message);
        return bcResponse.message;
    }


    /**
     * Gets an OAuth token for accessing the API, using the BC API's authentication method
     */
    private authenticateWithBlockchain = async (orgId:number): Promise<any> => {

        let token;

        //TODO get this from the organization service not directly from the database
        let results = await this._postgresService.getCredentials(orgId, 'blockchain-lab-adapter');

        if( results === undefined || results.rowCount !== 1){
            throw new ServiceError("Couldn't find BC credentials in database", 2000)
        }
        let encryptedData = {
            iv:  results.rows[0].password_iv,
            encryptedData: results.rows[0].password
        }

        let password;
        try{
            password = commonUtils.decrypt(encryptedData);
        }catch(error){
            throw new ServiceError(error, 2001);
        }

        let auth = {
            "email":  results.rows[0].username,
            "password": password
        }

        await axios.post(process.env.DFP_BLOCKCHAIN_API + "/api/user/login", auth).then(result => {
            token = result.data.token;
        }).catch(error => {
            throw new ServiceError(error, 3001);
        });

        return token;
    }
}
