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
            ErrorService.reportError(null, null, 4010, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4010), this.start.bind(this));
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
            ErrorService.reportError(null, null, 4010, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4010), this.start.bind(this));
        });
    }

    /**
     * Updates an event status and destination in the database
     *
     * @param eventId - the event id
     * @param eventStatus - the event status
     */
    updateEvent(eventId: string, eventStatus: string ) {
        const query = "UPDATE public.events set status=$1 WHERE id=$2";
        const values = [eventStatus, eventId];
        return this.pool.query(query, values);
    }

    /**
     * Inserts a new Event Destination into the database
     *
     * @param eventId - the event id
     * @param eventStatus - the status of putting the event onto the blockchain
     * @param blockchainResponse - the response from the blockchain
     * @param eventDestination - the destination of adapter
     */
    updateEventDestination(eventId: string, eventStatus: string, blockchainResponse: string, eventDestination: string) {
        const query = "INSERT INTO public.event_destinations (id, event_id, destination_name, status, timestamp, blockchain_response) VALUES ($1, $2, $3, $4, $5, $6)";
        const values = [commonUtils.generateID(), eventId, eventDestination, eventStatus, new Date(), blockchainResponse];
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
