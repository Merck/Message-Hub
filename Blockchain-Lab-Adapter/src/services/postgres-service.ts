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

import {CommonUtils} from "../utils/common-utils";
import {Pool} from "pg";

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
    }

    /**
     * Inserts a new Event Destination into the database
     *
     * @param eventId - the event id
     * @param eventStatus - the status of putting the event onto the blockchain
     * @param blockchainResponse - the response from the blockchain
     */
    updateEventDestination(eventId: string, eventStatus: string, blockchainResponse: string) {
        const query = "INSERT INTO public.event_destinations (id, event_id, destination_name, service_name, status, timestamp, blockchain_response) VALUES ($1, $2, $3, $4, $5, $6, $7)";
        const values = [commonUtils.generateID(), eventId, "Blockchain Lab", "blockchain-lab-adapter", eventStatus, new Date(), blockchainResponse];
        return this.pool.query(query, values).then(result => {
            this.deleteNorouteDestinationEvents(eventId);
            return Promise.resolve(result);
        });
    }

    /**
     * Updates an event status and destination in the database
     *
     * @param eventId - the event id
     * @param eventStatus - the event status
     * @param eventDestination - the event destination
     */
    updateEventStatus(eventId: string, eventStatus: string) {
        const query = "UPDATE public.events set status=$1 WHERE id=$2";
        const values = [eventStatus, eventId];
        return this.pool.query(query, values);
    }

    /**
     * Deletes "No Route Found" destination records from database.
     *
     * @param eventId - the event id
     */
    deleteNorouteDestinationEvents(eventId: string) {
        const query = "delete from event_destinations where event_id = $1 and destination_name = $2 and status = $3";
        const values = [eventId, 'No Route Found', 'failed'];
        return this.pool.query(query, values);
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
     */
    updateMasterdataDestination(masterdataId: string, masterdataStatus: string, blockchainResponse: string) {
        const query = "INSERT INTO public.masterdata_destinations (id, masterdata_id, destination_name, service_name, status, timestamp, blockchain_response) VALUES ($1, $2, $3, $4, $5, $6, $7)";
        const values = [commonUtils.generateID(), masterdataId, "Blockchain Lab", "blockchain-lab-adapter", masterdataStatus, new Date(), blockchainResponse];
        return this.pool.query(query, values).then(result => {
            this.deleteNorouteDestinationMasterdata(masterdataId);
            return Promise.resolve(result);
        });
    }

    /**
     * Deletes "No Route Found" destination records from database.
     *
     * @param masterdataId - the masterdata id
     */
    deleteNorouteDestinationMasterdata(masterdataId: string) {
        const query = "delete from masterdata_destinations where masterdata_id = $1 and destination_name = $2 and status = $3";
        const values = [masterdataId, 'No Route Found', 'failed'];
        return this.pool.query(query, values);
    }

    getCredentials(organizationId: number, adapterName: string) {
        const query = "SELECT creds.username, creds.password, creds.password_iv from public.organization_credentials as creds FULL OUTER JOIN public.adapters as adapters on adapters.id = creds.adapter_id WHERE creds.organization_id=$1 AND adapters.service_name=$2";
        const values = [organizationId, adapterName];
        return this.pool.query(query, values);
    }
}