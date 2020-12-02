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
 * EPCIS MESSAGING HUB - DATA PRIVACY RULES SERVICE

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

    getAllRulesForOrganization(orgid: number) {
        const query = 'SELECT * from data_privacy_rules WHERE organization_id = $1';
        const values = [orgid];
        return this.pool.query(query, values);
    }

    /**
     * Get all of the data privacy rules for an organization
     *
     * @param orgId
     */
    getAllDataPrivacyRulesForOrganization(orgId: number) {
        const query = `select t0.id, t0.organization_id, t0.data_field, t0.can_store, t0.order, t1.data_type as datafield_type, t1.display_name as datafield_display, t1.path as datafield_path, t1.xpath as datafield_xpath FROM public.data_privacy_rules as t0 FULL OUTER JOIN public.data_privacy_rules_data_fields as t1 ON t1.id = t0.data_field WHERE t0.status='ACTIVE' and t0.organization_id=$1 ORDER BY t0.order`;
        const values = [orgId];
        return this.pool.query(query, values);
    }


    /**
     * Gets the Data Privacy Rules History
     *
     * @param orgId
     */
    getDataPrivacyRulesHistory(orgId: number) {
        const query = `SELECT t3.rules_id, t3.change_description, t3.editor, t3.timestamp, t1.data_type as datafield_type, t1.display_name as new_datafield_display, t0.order as new_order, t0.can_store from public.data_privacy_rules_audit_log as t3 FULL OUTER JOIN public.data_privacy_rules as t0 on t0.id = t3.rules_id FULL OUTER JOIN public.data_privacy_rules_data_fields as t1 ON t1.id = t0.data_field where t3.organization_id = $1 ORDER BY timestamp DESC`;
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Creates a new data privacy rule
     *
     * @param orgId
     * @param dataField
     * @param canStore
     * @param order
     * @param editor
     */
    createDataPrivacyRule(orgId: number, dataField: number, canStore: boolean, order: number, editor: string) {
        const query = `INSERT INTO public.data_privacy_rules (organization_id, data_field, can_store, "order") VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [orgId, dataField, canStore, order];
        return this.pool.query(query, values).then(result => {
            this.createHistory(result.rows[0], editor, "CREATED");
            return Promise.resolve(result);
        });
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
        const query = "INSERT INTO public.data_privacy_rules_audit_log(rules_id, editor, organization_id, change_description) VALUES ($1, $2, $3, $4)";
        const values = [rule.id, editor, rule.organization_id, change];
        this.pool.query(query, values).then(() => {
            //do nothing
        });
    }

    /**
     * Gets a specific Data Privacy rule from the database
     *
     * @param orgId
     * @param ruleId
     */
    getDataPrivacyRule(orgId: number, ruleId: number){
        const query = `select t0.id, t0.organization_id, t0.data_field, t0.can_store, t1.data_type as datafield_type, t1.display_name as datafield_display, t1.path as datafield_path, t1.xpath as datafield_xpath, t0.order FROM public.data_privacy_rules as t0 FULL OUTER JOIN public.data_privacy_rules_data_fields as t1 ON t1.id = t0.data_field WHERE t0.id=$1 and t0.organization_id=$2`
        //const query = "SELECT * FROM public.routing_rules WHERE id=$1 and organization_id=$2";
        const values = [ruleId, orgId];
        return this.pool.query(query, values);
    }

    /**
     * Updates a single Data Privacy rule
     *
     * @param orgId
     * @param ruleId
     * @param dataField
     * @param canStore
     * @param editor
     */
    updateDataPrivacyRule(orgId: number, ruleId: number, dataField: number, canStore: boolean, editor: string) {
        let query, values = undefined;
        if (dataField != undefined && canStore != undefined) {
            query = `UPDATE public.data_privacy_rules set data_field=$1, can_store=$2 WHERE id=$3 and organization_id=$4 and status!='DELETED' RETURNING *`;
            values = [dataField, canStore, ruleId, orgId];
        } else if (dataField != undefined) {
            query = `UPDATE public.data_privacy_rules set data_field=$1 WHERE id=$2 and organization_id=$3 and status!='DELETED' RETURNING *`;
            values = [dataField, ruleId, orgId];
        } else {
            query = `UPDATE public.data_privacy_rules set can_store=$1 WHERE id=$2 and organization_id=$3 and status!='DELETED' RETURNING *`;
            values = [canStore, ruleId, orgId];
        }
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
     updateDataPrivacyRulesOrdering(orgId: number, rulesList: any[], editor: string) {
         const query = `UPDATE public.data_privacy_rules set "order"=$1 WHERE id=$2 and organization_id=$3 RETURNING *`;
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
     * Deletes a Data Privacy rule
     *
     * @param ruleId
     * @param editor
     */
    deleteDataPrivacyRule(orgId: number, ruleId: number, editor: string) {
        const query = "UPDATE public.data_privacy_rules set status='DELETED' WHERE id=$1 and organization_id=$2 RETURNING *"
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
     * Gets the configured values in the dataprivacy_rules_data_fields table
     */
    getDataFields(){
        const query = "select * from public.data_privacy_rules_data_fields"
        return this.pool.query(query);
    }

}