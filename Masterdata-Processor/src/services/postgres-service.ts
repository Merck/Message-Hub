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

import {CommonUtils} from "../utils/common-utils";
import {Pool} from "pg";
import { ErrorService } from '../services/error-service'
import { ServiceError } from "../errors/service-error";

let commonUtils = new CommonUtils();

/**
 * This class is responsible for interfacing with the Postgres database
 */
export class PostgresService {

    /**
     * Create a connection pool
     * @private
     */
    private pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: (process.env.PGPORT as unknown) as number,
        ssl: {
            ca: commonUtils.decodeBase64(process.env.PGCERT as string)
        }
    });

    /**
     * Service constructor
     */
    constructor() {
        this.pool.on('error', (err: any) => {
            ErrorService.reportError(null, null, 4009, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4009), this.start.bind(this));
        });
    }

    /**
     * Create a connection pool
     * @private
     */
    public start() {
        this.pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: (process.env.PGPORT as unknown) as number,
            ssl: {
                ca: commonUtils.decodeBase64(process.env.PGCERT as string)
            }
        });
        this.pool.on('error', (err: any) => {
            ErrorService.reportError(null, null, 4009, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4009), this.start.bind(this));
        });
    }

    /**
     * Updates an masterdata status and destination in the database
     *
     * @param masterdataId - the masterdata id
     * @param masterdataStatus - the masterdata status
     */
    updateMasterdata(masterdataId: string, masterdataStatus: string ) {
        const query = "UPDATE public.masterdata set status=$1 WHERE id=$2";
        const values = [masterdataStatus, masterdataId];
        return this.pool.query(query, values);
    }

    /**
     * Inserts a new masterdata Destination into the database
     *
     * @param masterdataId - the masterdata id
     * @param masterdataStatus - the status of putting the masterdata onto the blockchain
     * @param blockchainResponse - the response from the blockchain
     * @param eventDestination - the destination of adapter
     */
    updateMasterdataDestination(masterdataId: string, masterdataStatus: string, blockchainResponse: string, eventDestination: string) {
        const query = "INSERT INTO public.masterdata_destinations (id, masterdata_id, destination_name, status, timestamp, blockchain_response) VALUES ($1, $2, $3, $4, $5, $6)";
        const values = [commonUtils.generateID(), masterdataId, eventDestination, masterdataStatus, new Date(), blockchainResponse];
        return this.pool.query(query, values);
    }

    /**
     * Gets the display name of the adapter
     *
     * @param serviceName - the adapter service name
     */
    getDisplayNameOfAdapter(serviceName: string) {
        const query = "SELECT display_name from adapters where service_name = $1";
        const values = [serviceName];
        return this.pool.query(query, values);
    }


    /**
     * Handle error to reconnect to pg pool again.
     *
     * @param error
     * @param callback
     * @public
     */
    public handlePgPoolError(error: any, callback: Function): void {
        if (error instanceof ServiceError) {
            ErrorService.reportError(null, null, 2011, error, null);
            setTimeout(() => callback(), 60000);
        }
    }
}