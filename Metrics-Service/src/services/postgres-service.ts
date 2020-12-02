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
 * EPCIS MESSAGING HUB -METRICS SERVICE

 */

import { CommonUtils } from "../utils/common-utils";
import { Pool } from "pg";

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
     * Gets count of event messages for an organization.
     *
     * @param orgId
     */
    async getCountOfEvents(orgId: number) {
        try {
            const query = 'SELECT COUNT(DISTINCT id) from public.events WHERE organization_id = $1';
            const values = [orgId];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of masterdata messages for an organization.
     *
     * @param orgId
     */
    async getCountOfMasterdata(orgId: number) {
        try {
            const query = 'SELECT COUNT(DISTINCT id) from public.masterdata WHERE organization_id = $1';
            const values = [orgId];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages for past week for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsPastWeek(orgId: number) {
        try {
            let eventsTypeCount: any = [];
            for (let day = 1; day < 8; day++) {
                let eventsType: any = {};
                let date;
                const types = ['object', 'transaction', 'transformation'];
                for (let i = 0; i < types.length; i++) {
                    const query = `select date (current_date - interval '1 days' * $3), count (distinct id) from public.events where "type" = $2 and organization_id = $1 and "timestamp" between current_date - interval '1 days' * $3 and current_date - interval '1 days' * ($3-1)`;
                    const values = [orgId, types[i], day];
                    const result = await this.pool.query(query, values);
                    eventsType[types[i]] = result.rows[0].count;
                    date = result.rows[0].date;
                    
                }
                const dateObj = new Date(date);
                eventsType.date = dateObj.toLocaleDateString();
                eventsTypeCount.push(eventsType);
            }
            return eventsTypeCount;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages for past day for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsPastDay(orgId: number) {
        try {
            let eventsTypeCount: any = [];
            for (let hour = 4; hour <= 24; hour= hour+4) {
                let eventsType: any = {};
                const types = ['object', 'transaction', 'transformation'];
                for (let i = 0; i < types.length; i++) {
                    const query = `select count (distinct id) from public.events where "type" = $2 and organization_id = $1 and "timestamp" between current_date - interval '1 hours' * $3 and current_date - interval '1 hours' * ($3-4)`;
                    const values = [orgId, types[i], hour];
                    const result = await this.pool.query(query, values);
                    eventsType[types[i]] = result.rows[0].count;
                }
                eventsType.hours = hour;
                eventsTypeCount.push(eventsType);
            }
            if (eventsTypeCount.length > 0) {
                let value = { hours: 0, object: 0, transaction: 0, transformation: 0 };
                eventsTypeCount.unshift(value);
            }
            return eventsTypeCount;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages for past hour for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsPastHour(orgId: number) {
        try {
            let eventsTypeCount: any = [];
            for (let min = 10; min <= 60; min= min+10) {
                let eventsType: any = {};
                const types = ['object', 'transaction', 'transformation'];
                for (let i = 0; i < types.length; i++) {
                    const query = `select count (distinct id) from public.events where "type" = $2 and organization_id = $1 and "timestamp" between current_date - interval '1 minutes' * $3 and current_date - interval '1 minutes' * ($3-10)`;
                    const values = [orgId, types[i], min];
                    const result = await this.pool.query(query, values);
                    eventsType[types[i]] = result.rows[0].count;
                }
                eventsType.minutes = min;
                eventsTypeCount.push(eventsType);
            }
            if (eventsTypeCount.length > 0) {
                let value = { minutes: 0, object: 0, transaction: 0, transformation: 0 };
                eventsTypeCount.unshift(value);
            }
            return eventsTypeCount;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages by type for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsType(orgId: number) {
        try {
            let eventsTypeCount: any = [];
            const types = ['object', 'transaction', 'transformation'];
            for (let i = 0; i < types.length; i++) {
                let eventsType: any = {};
                const query = 'SELECT COUNT(DISTINCT id) from public.events WHERE type = $2 and organization_id = $1';
                const values = [orgId, types[i]];
                const result = await this.pool.query(query, values);
                eventsType.type = types[i];
                eventsType.count = parseInt(result.rows[0].count);
                eventsTypeCount.push(eventsType);
            }
            return eventsTypeCount;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages by source for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsSource(orgId: number) {
        try {
            const query = 'select source, count ("source") from public.events where organization_id = $1 group by source';
            const values = [orgId];
            const result = await this.pool.query(query, values);
            return result.rows;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages by destination for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsDestination(orgId: number) {
        try {
            const query = 'select ed.destination_name, count (ed.destination_name) from public.event_destinations as ed full outer join public.events as e on ed.event_id = e.id where e.organization_id = $1 group by ed.destination_name';
            const values = [orgId];
            const result = await this.pool.query(query, values);
            let rows = result.rows;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].destination_name === null)
                    rows.splice(i, 1);
            }
            return rows;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of event messages by status for an organization.
     *
     * @param orgId
     */
    async getCountOfEventsStatus(orgId: number) {
        try {
            const query = 'select status, count ("status") from public.events where organization_id = $1 group by status';
            const values = [orgId];
            const result = await this.pool.query(query, values);
            return result.rows;
        } catch (err) {
            throw err;
        }
    }
}