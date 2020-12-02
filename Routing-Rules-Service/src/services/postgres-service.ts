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
 * EPCIS MESSAGING HUB - ROUTING RULES SERVICE

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
     * Gets all of the routing rules for an organization
     *
     * @param orgId
     */
    getAllRulesForOrganization(orgId: number) {
        const query = `select t0.id, t0.organization_id, t0.data_field, t1.data_type as datafield_type, t1.display_name as datafield_display, t1.path as datafield_path, t1.value_prefix as datafield_prefix, t0.comparator, t2.operation as comparator_operation, t2.display_name as comparator_display, t0.value, t0.destinations, t0.order FROM public.routing_rules as t0 FULL OUTER JOIN public.routing_rules_data_fields as t1 ON t1.id = t0.data_field FULL OUTER JOIN public.routing_rules_comparators as t2 ON t2.id = t0.comparator WHERE t0.status='ACTIVE' and t0.organization_id=$1 ORDER BY t0.order`
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Creates a new routing rule
     *
     * @param orgId
     * @param dataelement
     * @param comparator
     * @param value
     * @param destination
     * @param order
     * @param editor
     */
    createRoutingRule(orgId: number, dataelement: number, comparator: number, value: string, destination: JSON, order: number, editor: string) {
        const query = `INSERT INTO public.routing_rules( organization_id, data_field, comparator, value, destinations, "order") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const values = [orgId, dataelement, comparator, value, JSON.stringify(destination), order];
        return this.pool.query(query, values).then(result => {
            this.createHistory(result.rows[0], editor, "CREATED");
            return Promise.resolve(result);
        });
    }

    /**
     * Gets a specific routing rule from the database
     *
     * @param orgId
     * @param ruleId
     */
    getRoutingRule(orgId: number, ruleId: number){
        const query = `select t0.id, t0.organization_id, t0.data_field, t1.data_type as datafield_type, t1.display_name as datafield_display, t1.path as datafield_path, t1.value_prefix as datafield_prefix, t0.comparator, t2.operation as comparator_operation, t2.display_name as comparator_display, t0.value, t0.destinations, t0.order FROM public.routing_rules as t0 FULL OUTER JOIN public.routing_rules_data_fields as t1 ON t1.id = t0.data_field FULL OUTER JOIN public.routing_rules_comparators as t2 ON t2.id = t0.comparator WHERE t0.id=$1 and t0.organization_id=$2`
        //const query = "SELECT * FROM public.routing_rules WHERE id=$1 and organization_id=$2";
        const values = [ruleId, orgId];
        return this.pool.query(query, values);
    }

    /**
     * Updates a single routing rule
     *
     * @param orgId
     * @param ruleId
     * @param dataelement
     * @param comparator
     * @param value
     * @param destination
     * @param order
     * @param editor
     */
    updateRoutingRule(orgId: number, ruleId: number, dataelement: number, comparator: number, value: string, destination: JSON, order: number, editor: string) {
        const query = `UPDATE public.routing_rules set data_field=$1, comparator=$2, value=$3, destinations=$4, "order"=$5 WHERE id=$6 and organization_id=$7 RETURNING *`;
        const values = [dataelement, comparator, value, JSON.stringify(destination), order, ruleId, orgId];
        return this.pool.query(query, values).then(result => {
            this.createHistory(result.rows[0], editor, "UPDATED");
            return Promise.resolve(result);
        });
    }

    /**
     * Updates the ordering of multiple rule ids sent in a JSON array [3,25,2,1]
     *
     * @param orgId
     * @param rulesList
     * @param editor
     */
    updateRoutingRulesOrdering(orgId:number, rulesList: [], editor: string) {
        const query = `UPDATE public.routing_rules set "order"=$1 WHERE id=$2 and organization_id=$3 RETURNING *`;
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < rulesList.length; i++) {
                const values = [i + 1, rulesList[i], orgId];
                await this.pool.query(query, values).then(result => {
                    if( result.rows.length > 0 ) {
                        this.createHistory(result.rows[0], editor, "REORDERED");
                    }
                }).catch(e => {
                    reject(e);
                });
            }
            resolve("ok");
        });
    }


    /**
     * Deletes a routing rule
     *
     * @param ruleId
     * @param editor
     */
    deleteRoutingRule(orgId: number, ruleId: number, editor: string) {
        const query = "UPDATE public.routing_rules set status='DELETED' WHERE id=$1 and organization_id=$2 RETURNING *"
        const values = [ruleId, orgId];
        return this.pool.query(query, values).then(result => {
            if( result.rows.length > 0 ) {
                this.createHistory(result.rows[0], editor, "DELETED");
            }else{
                return Promise.reject( new Error("no rule found with that id"));
            }
            return Promise.resolve(result);
        });
    }

    /**
     * Gets the Routing Rules History
     *
     * @param orgId
     */
    getAuditHistory(orgId: number) {
        const query = `SELECT t3.rules_id, t3.change_description, t3.editor, t3.timestamp, t1.data_type as datafield_type, t1.display_name as new_datafield_display, t2.display_name as new_comparator_display, t0.value as new_value, t0.destinations as new_destinations, t0.order as new_order from public.routing_rules_audit_log as t3 FULL OUTER JOIN public.routing_rules as t0 on t0.id = t3.rules_id FULL OUTER JOIN public.routing_rules_data_fields as t1 ON t1.id = t0.data_field FULL OUTER JOIN public.routing_rules_comparators as t2 ON t2.id = t0.comparator where t3.organization_id = $1 ORDER BY timestamp DESC`;
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Create a new history for the rule change
     *
     * @param rule
     * @param editor
     * @param change
     * @private
     */
    private createHistory(rule: any, editor: string, change: string) {
        const query = "INSERT INTO public.routing_rules_audit_log( rules_id, editor, organization_id, change_description) VALUES ( $1, $2, $3, $4)";
        const values = [rule.id, editor, rule.organization_id, change];
        this.pool.query(query, values).then(() => {
            //do nothing
        });
    }

    /**
     * Gets the configured values in the routing_rules_data_fields table
     */
    getDataFields(){
        const query = "select * from public.routing_rules_data_fields"
        return this.pool.query(query);
    }

    /**
     * Gets the configured values in the routing_rules_comparators table
     */
    getComparators(){
        const query = "select * from public.routing_rules_comparators"
        return this.pool.query(query);
    }

    /**
     * Gets the configured values in the adapters table
     */
    getAdapters(){
        const query = "select * from public.adapters where active=true"
        return this.pool.query(query);
    }
}