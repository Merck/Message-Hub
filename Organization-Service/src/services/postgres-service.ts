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
 * EPCIS MESSAGING HUB - ORGANIZATION SERVICE

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
     * Gets the organization for a given subject id
     *
     * @param subjectid
     */
    getOrganizationForUserSubjectId(subjectid: string) {
        const query = 'SELECT organization_users.*, organizations.name as organization_name from organization_users FULL OUTER JOIN organizations on organizations.id = organization_users.organization_id WHERE organization_users.subject_id = $1';
        const values = [subjectid];
        return this.pool.query(query, values);
    }

    /**
     * Get the organization for a given user
     *
     * @param username
     */
    getOrganizationForUser(username: string) {
        const query = 'SELECT organization_users.*, organizations.name as organization_name from organization_users FULL OUTER JOIN organizations on organizations.id = organization_users.organization_id WHERE organization_users.username = $1';
        const values = [username];
        return this.pool.query(query, values);
    }

    /**
     * Gets an organization for a given client id
     *
     * @param clientId
     */
    getOrganizationForClient(clientId: string) {
        const query = 'SELECT organization_clients.*, organizations.name as organization_name from organization_clients FULL OUTER JOIN organizations on organizations.id = organization_clients.organization_id WHERE organization_clients.client_id = $1';
        const values = [clientId];
        return this.pool.query(query, values);
    }

    /**
     * Gets the organization details for a given org id
     *
     * @param orgId
     */
    getOrganization(orgId: number) {
        const query = 'SELECT * from organizations WHERE id = $1';
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Creates a new organization in the database
     *
     * @param name
     */
    createOrganization(name: string) {
        const query = 'INSERT INTO organizations (name) VALUES ($1) RETURNING *';
        const values = [name];
        return this.pool.query(query, values);
    }

    /**
     * Updates an organization in the database
     *
     * @param orgId
     * @param name
     */
    updateOrganization(orgId: number, name: string) {
        const query = 'UPDATE organizations set name = $2 WHERE id = $1 RETURNING *';
        const values = [orgId, name];
        return this.pool.query(query, values);
    }

    /**
     * Gets the users for an organization
     *
     * @param orgId
     */
    getOrganizationUsers(orgId: number) {
        const query = 'SELECT * from organization_users WHERE organization_id = $1';
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Gets a particular user for a given organization
     *
     * @param orgId
     * @param subjectId
     */
    getOrganizationUser(orgId: number, subjectId: string) {
        const query = 'SELECT * from organization_users WHERE organization_id = $1 and subject_id = $2';
        const values = [orgId, subjectId];
        return this.pool.query(query, values);
    }

    /**
     * Adds a user to an organization
     *
     * @param orgId
     * @param username
     * @param subjectId
     */
    createOrganizationUser(orgId: number, subjectId: string, username: string ){
        const query = 'INSERT INTO organization_users (organization_id, username, subject_id) VALUES($1, $2, $3) RETURNING *';
        const values = [orgId, username, subjectId];
        return this.pool.query(query, values);
    }

    /**
     * Updates a user's subjectId for an organization
     *
     * @param orgId
     * @param subjectId
     * @param newUsername
     */
    updateOrganizationUser(orgId: number, subjectId: string, newUsername: string){
        const query = 'UPDATE organization_users SET username = $3 WHERE organization_id = $1 and subject_id = $2 RETURNING *';
        const values = [orgId, subjectId, newUsername];
        return this.pool.query(query, values);
    }

    /**
     * Deletes a user from an organization
     *
     * @param orgId
     * @param subjectId
     */
    deleteOrganizationUser(orgId: number, subjectId: string){
        const query = 'DELETE from organization_users WHERE organization_id = $1 and subject_id = $2';
        const values = [orgId, subjectId];
        return this.pool.query(query, values);
    }


    /**
     * Gets all the client id for an organization
     *
     * @param orgId
     */
    getOrganizationClients(orgId: number) {
        const query = 'SELECT * from organization_clients WHERE organization_id = $1';
        const values = [orgId];
        return this.pool.query(query, values);
    }

    /**
     * Gets a particular client for a given org id and client id
     *
     * @param orgId
     * @param clientId
     */
    getOrganizationClient(orgId: number, clientId: string) {
        const query = 'SELECT * from organization_clients WHERE organization_id = $1 and client_id = $2';
        const values = [orgId, clientId];
        return this.pool.query(query, values);
    }

    /**
     * Adds a user to an organization
     *
     * @param orgId
     * @param username
     * @param subjectId
     */
    createOrganizationClient(orgId: number, clientId: string, sourceName: string){
        const query = 'INSERT INTO organization_clients (organization_id, client_id, source_name) VALUES($1, $2, $3) RETURNING *';
        const values = [orgId, clientId, sourceName];
        return this.pool.query(query, values);
    }

    /**
     * Updates a client's source name
     *
     * @param orgId
     * @param clientId
     * @param sourceName
     */
    updateOrganizationClient(orgId: number, clientId: string, sourceName: string){
        const query = 'UPDATE organization_clients  SET source_name = $3 WHERE organization_id = $1 and client_id = $2 RETURNING *';
        const values = [orgId, clientId, sourceName];
        return this.pool.query(query, values);
    }

    /**
     * Deletes a user from an organization
     *
     * @param orgId
     * @param clientId
     */
    deleteOrganizationClient(orgId: number, clientId: string){
        const query = 'DELETE from organization_clients WHERE organization_id = $1 and client_id = $2';
        const values = [orgId, clientId];
        return this.pool.query(query, values);
    }
}