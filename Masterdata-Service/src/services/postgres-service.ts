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
 * EPCIS MESSAGING HUB - MASTER DATA SERVICE

 */

import { CommonUtils } from "../utils/common-utils";
import { Pool } from "pg";
import { ErrorService } from '../services/error-service'
import { ServiceError } from "../errors/service-error";

let commonUtils = new CommonUtils();
const config = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: (process.env.PGPORT as unknown) as number,
    ssl: {
        ca: commonUtils.decodeBase64(process.env.PGCERT as string)
    }
};

/**
 * This class is responsible for interfacing with the Postgres database
 */
export class PostgresService {

    /**
     * Create a connection pool
     * @private
     */
    private pool = new Pool(config);

    /**
     * Service constructor
     */
    constructor() {
        this.pool.on('error', (err: any) => {
            ErrorService.reportError(null, null, 4017, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4017), this.start.bind(this));
        });
    }

    /**
     * Create a connection pool
     * @private
     */
    public start() {
        this.pool = new Pool(config);
        this.pool.on('error', (err: any) => {
            ErrorService.reportError(null, null, 4017, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4017), this.start.bind(this));
        });
    }

    /**
     * Insert a new master data into the master data table
     *
     * @param masterdataId - the hub's unique identifier for the masterdata
     * @param masterdataTime - the time of the masterdata read
     * @param clientId - the source of the data (client credentials used to post data to the hub)
     * @param orgId - the API caller's organization id
     * @param source - the source of the data (human-friendly)
     * @param status - the status of the masterdata as it moves through the hub
     * @param xmlFile - the original XML payload (may be redacted based on data privacy rules)
     * @param jsonData - the stringified json payload (may be redacted based on data privacy rules)
     */
    insertMasterData(masterdataId: string, masterdataTime: string, clientId: string, orgId: number, source: string, status: string, xmlFile: any, jsonData: string) {
        const query = "INSERT INTO public.masterdata(id, timestamp, client_id, organization_id, source, status, xml_data, json_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
        const values = [masterdataId, masterdataTime, clientId, orgId, source, status, xmlFile, jsonData];
        return this.pool.query(query, values);
    }

    /**
     * Gets the masterdata status based on the provided masterdata id and the API caller's organization
     *
     * @param orgId - the API caller's organization id
     * @param masterdataId - the masterdata id
     */
    getMasterdataStatusForOrganization(orgId: number, masterdataId: string) {
        const query = "SELECT status from public.masterdata WHERE id=$2 and organization_id=$1";
        const values = [orgId, masterdataId];
        return this.pool.query(query, values);
    }

    /**
     * Get all masterdata based on the provided the API caller's organization id
     *
     * @param orgId - the API caller's organization id
     * @param masterdataId - the masterdata id
     */
    getAllMasterdataForOrganization(orgId: number) {
        const query = "SELECT * from public.masterdata WHERE organization_id=$1 ORDER BY timestamp desc";
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Gets the list of blockchain adapter destinations the master data was sent to
     *
     * @param masterdataId - the master data id
     */
    async getDestinationsForMasterdata(masterdataId: string) {
        const query = "SELECT destination_name, service_name, status, timestamp, blockchain_response from public.masterdata_destinations WHERE masterdata_id =$1";
        const values = [masterdataId];
        return this.pool.query(query, values);
    }

    /**
     * Updates the masterdata status in the database
     *
     * @param masterdataId - the masterdata id
     * @param masterdataStatus - the masterdata status
     */
    updateMasterdataStatus(masterdataId: string, masterdataStatus: string ) {
        const query = "UPDATE public.masterdata set status=$1 WHERE id=$2";
        const values = [masterdataStatus, masterdataId];
        return this.pool.query(query, values);
    }

    /**
     * Delete masterdata based on the provided the API caller's master data id and org Id
     * @param orgId- the API caller's organization id
     * @param masterdataId - the masterdata id
     */
    deleteMasterdata(orgId: number, masterdataId: string) {
        const query = "DELETE from public.masterdata WHERE id=$1 and organization_id=$2";
        const values = [masterdataId, orgId];
        return this.pool.query(query, values);
    }

    /**
     * Gets the masterdata details based on the provided masterdata id and the API caller's organization
     *
     * @param orgId - the API caller's organization id
     * @param masterdataId - the masterdata id
     */
    getMasterdataForOrganization(orgId: number, masterdataId: string) {
        const query = "SELECT * from public.masterdata WHERE id=$2 and organization_id=$1";
        const values = [orgId, masterdataId];
        return this.pool.query(query, values);
    }

    /**
     * Gets a list of distinct masterdata sources for the organization
     *
     * @param orgId - the API caller's organization id
     */
    getDistinctMasterdataSourcesForOrganization(orgId: number) {
        const query = "SELECT DISTINCT source from public.masterdata WHERE organization_id=$1 and source <> ''";
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Set the queue status of masterdata to pause/resume the processing queue
     *
     * @param events_paused - the events processing queue status
     * @param masterdata_paused - the masterdata processing queue status
     * @param updated_by - updated by 
     */
    setMasterdataQueueStatus(events_paused: boolean, masterdata_paused: boolean, updated_by: string) {
        const query = "INSERT INTO public.queue_status(events_paused, masterdata_paused, updated_by) VALUES ($1, $2, $3) RETURNING *";
        const values = [events_paused, masterdata_paused, updated_by];
        return this.pool.query(query, values);
    }

    /**
     * Gets the queue status of processing queue
     *
     */
    getMasterdataQueueStatus() {
        const query = `SELECT * from public.queue_status order by "timestamp" desc limit 1`;
        return this.pool.query(query);
    }

    /**
     * Gets a list of distinct masterdata destinations for the organization
     *
     * @param orgId - the API caller's organization id
     */
    getDistinctMasterdataDestinationsForOrganization(orgId: number) {
        const query = "SELECT DISTINCT public.masterdata_destinations.destination_name as destination from public.masterdata_destinations FULL OUTER JOIN public.masterdata ON public.masterdata.id = public.masterdata_destinations.masterdata_id  WHERE public.masterdata.organization_id=$1 and public.masterdata_destinations.destination_name <> ''";
        const values = [orgId];
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