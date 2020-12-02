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
 * EPCIS MESSAGING HUB - ALERT SERVICE

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
     * Creates a new alert
     *
     * @param orgId
     * @param severity
     * @param source
     * @param errorCode
     * @param errorEngDesc
     * @param errorMsg
     */
    async createAlert(orgId: number, severity: string, source: string, errorCode: string, errorEngDesc: string, errorMsg: string) {
        try {
            const query = `INSERT INTO public.alerts (organization_id, severity, source, error_code, error_description, error_stacktrace) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [orgId, severity, source, errorCode, errorEngDesc, errorMsg];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets all alerts for an organization. Support pagination
     *
     * @param orgId
     * @param pagenumber
     * @param resultsperpage
     */
    async getAllAlertsForOrganization(orgId: number, pagenumber: number, resultsperpage: number) {
        try {
            const offset = (pagenumber - 1) * resultsperpage;
            const query = 'SELECT * from public.alerts WHERE organization_id = $1 ORDER BY "timestamp" desc LIMIT $3 OFFSET $2';
            const values = [orgId, offset, resultsperpage];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets count of alerts for an organization.
     *
     * @param orgId
     */
    async getCountOfAlerts(orgId: number) {
        try {
            const query = 'SELECT COUNT(DISTINCT id) from public.alerts WHERE organization_id = $1';
            const values = [orgId];
            return await this.pool.query(query, values);
        } catch(err) {
            throw err;
        }
    }

    /**
     * Gets count of error alerts for an organization.
     *
     * @param orgId
     */
    async getCountOfErrorAlerts(orgId: number) {
        try {
            const severity = 'ERROR';
            const query = `SELECT count (DISTINCT id) from public.alerts WHERE organization_id = $1 AND severity = $2`;
            const values = [orgId, severity];
            return await this.pool.query(query, values);
        } catch(err) {
            throw err;
        }
    }

    /**
     * Gets count of warning alerts for an organization.
     *
     * @param orgId
     */
    async getCountOfWarningAlerts(orgId: number) {
        try {
            const severity = 'WARNING';
            const query = `SELECT count (DISTINCT id) from public.alerts WHERE organization_id = $1 and severity = $2`;
            const values = [orgId, severity];
            return await this.pool.query(query, values);
        } catch(err) {
            throw err;
        }
    }

    /**
     * Get an alert
     *
     * @param orgId
     * @param alertId
     */
    async getAlert(orgId: number, alertId: string) {
        try {
            const query = 'SELECT * from public.alerts WHERE organization_id = $1 and id = $2';
            const values = [orgId, alertId];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Deletes all alerts for an organization
     *
     * @param orgId
     */
    async deleteAllAlertsForOrganization(orgId: number) {
        try {
            const query = 'DELETE from public.alerts WHERE organization_id = $1';
            const values = [orgId];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Delete an alert
     *
     * @param orgId
     * @param alertId
     */
    async deleteAlert(orgId: number, alertId: string) {
        try {
            const query = 'DELETE from public.alerts WHERE organization_id = $1 and id = $2';
            const values = [orgId, alertId];
            return await this.pool.query(query, values);
        } catch (err) {
            throw err;
        }
    }

}