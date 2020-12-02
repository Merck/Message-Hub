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
 * EPCIS MESSAGING HUB - EVENT SERVICE

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
            ErrorService.reportError(null, null, 4016, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4016), this.start.bind(this));
        });
    }

    /**
     * Create a connection pool
     * @private
     */
    public start() {
        this.pool = new Pool(config);
        this.pool.on('error', (err: any) => {
            ErrorService.reportError(null, null, 4016, err.stack, null);
            this.handlePgPoolError(new ServiceError(err, 4016), this.start.bind(this));
        });
    }

    /**
     * Insert a new event into the events table
     *
     * @param eventId - the hub's unique identifier for the event
     * @param eventTime - the time of the event read from the source data
     * @param eventType - the event type (object, aggregation, transaction, transformation)
     * @param eventAction - the event action (add, observe, delete)
     * @param eventStatus - the status of the event as it moves through the hub
     * @param clientId - the source of the data (client credentials used to post data to the hub)
     * @param source - the source of the data (human-friendly)
     * @param orgId - the API caller's organization id
     * @param xmlData - the original XML payload (may be redacted based on data privacy rules)
     * @param jsonData - the original XML payload converted to JSON (may be redacted based on data privacy rules)
     */
    insertEvent(eventId: string, eventTime: string, eventType: any, eventAction: any, eventStatus: string,
                clientId: string, source: string, orgId: number, xmlData: any, jsonData: any) {
        const query = "INSERT INTO public.events(id, timestamp, client_id, organization_id, type, action, source, status, xml_data, json_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
        const values = [eventId, eventTime, clientId, orgId, eventType, eventAction, source, eventStatus, xmlData, jsonData];
        return this.pool.query(query, values);
    }

    /**
     * Gets the event status based on the provided event id and the API caller's organization
     *
     * @param orgId - the API caller's organization id
     * @param eventId - the event id
     */
    getEventStatusForOrganization(orgId: number, eventId: string) {
        const query = "SELECT id, status from public.events WHERE id=$2 and organization_id=$1";
        const values = [orgId, eventId];
        return this.pool.query(query, values);
    }

    /**
     * Gets the event details based on the provided event id and the API caller's organization
     *
     * @param orgId - the API caller's organization id
     * @param eventId - the event id
     */
    getEventForOrganization(orgId: number, eventId: string) {
        const query = "SELECT * from public.events WHERE id=$2 and organization_id=$1";
        const values = [orgId, eventId];
        return this.pool.query(query, values);
    }

    /**
     * Gets the list of blockchain adapter destinations the event was sent to
     *
     * @param eventId - the event id
     */
    getDestinationsForEvent(eventId: string) {
        const query = "SELECT destination_name, service_name, status, timestamp, blockchain_response from public.event_destinations WHERE event_id =$1";
        const values = [eventId];
        return this.pool.query(query, values);
    }

    /**
     * Updates the event status in the database
     *
     * @param eventId - the event id
     * @param eventStatus - the event status
     */
    updateEventStatus(eventId: string, eventStatus: string ) {
        const query = "UPDATE public.events set status=$1 WHERE id=$2";
        const values = [eventStatus, eventId];
        return this.pool.query(query, values);
    }

    /**
     * Set the queue status of event to pause/resume the processing queue
     *
     * @param events_paused - the events processing queue status
     * @param masterdata_paused - the masterdata processing queue status
     * @param updated_by - updated by 
     */
    setEventQueueStatus(events_paused: boolean, masterdata_paused: boolean, updated_by: string) {
        const query = "INSERT INTO public.queue_status(events_paused, masterdata_paused, updated_by) VALUES ($1, $2, $3) RETURNING *";
        const values = [events_paused, masterdata_paused, updated_by];
        return this.pool.query(query, values);
    }

    /**
     * Gets the queue status of processing queue
     *
     */
    getEventQueueStatus() {
        const query = `SELECT * from public.queue_status order by "timestamp" desc limit 1`;
        return this.pool.query(query);
    }

    /**
     * Gets a list of distinct event sources for the organization
     *
     * @param orgId - the API caller's organization id
     */
    getDistinctEventSourcesForOrganization(orgId: number) {
        const query = "SELECT DISTINCT source from public.events WHERE organization_id=$1 and source <> ''";
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Gets a list of distinct event destinations for the organization
     *
     * @param orgId - the API caller's organization id
     */
    getDistinctEventDestinationsForOrganization(orgId: number) {
        const query = "SELECT DISTINCT public.event_destinations.destination_name as destination from public.event_destinations FULL OUTER JOIN public.events ON public.events.id = public.event_destinations.event_id  WHERE public.events.organization_id=$1 and public.event_destinations.destination_name <> ''";
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