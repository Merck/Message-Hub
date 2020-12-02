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
 * EPCIS MESSAGING HUB - SEARCH SERVICE

 */

import path from "path";
import * as config from '../config/_es.search.settings.json';
import { CommonUtils } from "../utils/common-utils";
import { ErrorService } from "./error-service";

const { Client } = require('@elastic/elasticsearch');

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This class is responsible for interfacing with Elasticsearch
 */
export class ElasticSearchService {

    /**
     * Creates a new connection to the Elasticsearch instance
     * @private
     */
    private client = new Client({
        node: process.env.ESCOMPOSED,
        ssl: {
            ca: commonUtils.decodeBase64((process.env.ESCERT as unknown) as string)
        }
    });

    private eventModel: any = config.eventModel;

    /**
     * Initializes the search index
     */
    public createIndexMapping = async (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                let isPresent = await this.client.indices.exists({ index: config.model });
                if (!isPresent.body) {
                    await this.client.indices.create({ index: config.model });

                    const response = await this.client.indices.putMapping({
                        include_type_name: true,
                        index: config.model,
                        type: config.type,
                        body: {
                            properties: this.eventModel
                        }
                    });

                    const mapResp = await this.client.indices.getMapping({
                        index: config.model,
                        type: config.type
                    });

                    await resolve(response);
                } else {
                    await resolve(true);
                }
            } catch (error) {
                ErrorService.reportError(null, null, 4001, error.stack, null);
                await reject(error)
            }
        })
    };

    /**
     * Adds a new event to the search index
     *
     * @param data - the event data
     */
    public indexData = async (data: any): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Add the data into the  index of elastic search
                await this.client.index({
                    index: config.model,
                    type: config.type,
                    id: data.id,
                    body: data
                });

                // refresh the index
                await this.client.indices.refresh({ index: config.model });
                await resolve(true);
            } catch (error) {
                await reject(error)
            }
        })
    };

    /**
     * Gets an event in the search index
     *
     * @param id  - the event id
     */
    public async getIdData(id: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const { body } = await this.client.get({
                    index: config.model,
                    id: id
                });
                resolve(body._source);
            } catch (err) {
                reject(err)
            }
        });
    }


    /**
     * Updates an event in the search index
     *
     * @param data - the new data
     * @param id - the event id
     */
    public updateData = async (data: any, id: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // update with multiple destinations, if a previous destination is present.
            if (Object.keys(data).length > 0 && data.destination) {
                const idData: any = await this.getIdData(id);
                let currDestinations = idData.destination;
                if (Array.isArray(currDestinations)) {
                    const destIndex = currDestinations.indexOf(data.destination);
                    const noRouteIndex = currDestinations.indexOf('No Route Found');
                    if (data.destination !== 'No Route Found' && noRouteIndex > -1) {
                        currDestinations.splice(noRouteIndex, 1);
                    }
                    if (destIndex === -1) {
                        currDestinations.push(data.destination);
                    }
                    data.destination = currDestinations;
                } else {
                    let destinationArray = [];
                    destinationArray.push(data.destination);
                    data.destination = destinationArray;
                }
            }
            let resp: any = await this.client.update({
                id: id,
                index: config.model,
                type: config.type,
                body: { doc: data },
                refresh: "true"
            });

            // refresh the index
            await this.client.indices.refresh({ index: config.model }).then((message: any) => {
                resolve(resp);
            }).catch((e: any) => {
                ErrorService.reportError(null, null, 4003, e.stack, null);
                reject(e);
            });

        } catch (error) {
            ErrorService.reportError(null, null, 4004, error.stack, null);
            reject(error);
        }
    });
};

    /**
     * Deletes an event from the search index
     *
     * @param id - the event id
     */
    public deleteData = async (id: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            await this.client.delete({
                index: config.model,
                type: config.type,
                id: id
            });

            // refresh the index
            await this.client.indices.refresh({ index: config.model }).then((message: any) => {
                resolve(true);
            }).catch((e: any) => {
                ErrorService.reportError(null, null, 4003, e.stack, null);
                reject(e);
            });
        } catch (error) {
            ErrorService.reportError(null, null, 4005, error.stack, null);
            reject(error);
        }
    });
};

    /**
     * Queries the index
     *
     * @param querySearch - the search parameters
     */
    public queryElastic = async (querySearch: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { body } = await this.client.search(querySearch);
            const totalResults = body.hits.total;
            const size: number = querySearch.size;
            const start: number = querySearch.from;
            const page: number = Math.ceil(start / size) + 1;
            const arrayBody = body.hits.hits;
            const totalPages = Math.ceil(totalResults / size);

            let resBody = [];
            for (const index in arrayBody) {
                let data = arrayBody[index];
                resBody.push(data['_source']);
            }
            const searchResults = {
                totalResults: totalResults,
                totalPages: totalPages,
                currentPage: page,
                resultsPerPage: size,
                results: resBody,
                sort: querySearch.body.sort
            }

            resolve(searchResults);
        } catch (error) {
            reject(error);
        }
    });
};

    /**
     * Deletes the search index.
     */
    public deleteIndex = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            await this.client.indices.delete({ index: config.model });
            logger.info('Successfully deleted Elasticsearch index');
            await resolve(true);
        } catch (error) {
            ErrorService.reportError(null, null, 4007, error.stack, null);
            await reject(error);
        }
    });
}
}