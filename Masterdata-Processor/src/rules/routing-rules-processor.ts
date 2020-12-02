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
 * EPCIS MESSAGING HUB - MASTER DATA PROCESSOR

 */

import path from "path";
import {CommonUtils} from "../utils/common-utils";
import axios from "axios";
import { Engine } from "json-rules-engine"
import {ErrorService} from '../services/error-service'
import {ServiceError} from "../errors/service-error"

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This class is responsible for determining the destination based on the routing rules.
 */
export class RoutingRulesProcessor {

    /**
     * Processor constructor
     */
    constructor() {
    }

    /**
     * Determines the blockchain adapter destinations using the org's routing rules
     *
     * @param json - the masterdata payload
     * @param organizationId - the organization id
     */
    public async determineDestination( json: any, organizationId: number ): Promise<string[]> {
        let rules = await this.getRulesForOrganization(organizationId);
        return this.runRules( json, rules );
    }


    /**
     * Gets the rules for an organization by calling the routing-rules-service
     * TODO: This could be repetitive, think about caching the final rules
     *
     * @param organizationId
     */
    public async getRulesForOrganization( organizationId: number ): Promise<any[]> {
        let rules:any[] = [];
        await axios.get(process.env.ROUTING_RULES_SERVICE + "/organization/" + organizationId + "/routingrules" )
           .then(results => {
               if( results.data ){
                    for( let i=0; i < results.data.length; i++ ){
                        let routingRule = results.data[i];
                        //we only care about the masterdata rules
                        if( "masterdata" === routingRule.datafield_type ) {
                            let jsonRule = {
                                conditions: {
                                    any: [
                                        {
                                            fact: "masterdata",
                                            path: routingRule.datafield_path,
                                            operator: routingRule.comparator_operation,
                                            value: (routingRule.datafield_prefix ? routingRule.datafield_prefix : '') + routingRule.value
                                        }
                                    ]
                                },
                                event: {
                                    type: 'destinations',
                                    params: {
                                        destination: routingRule.destinations
                                    }
                                },
                                priority: (routingRule.order > 0 ? routingRule.order : 1)
                            };

                            rules.push(jsonRule);
                        }
                    }
               }
           }).catch(e => {                
            throw new ServiceError(e, 4001);
           }
        );
        if( rules.length === 0){
            throw new ServiceError(new Error("No Routing Rules processed for organization"), 4001);
        }
        return rules;
    }

    /**
     * Runs the rules against the json payload until a match is found
     *
     * @param json - the masterdata payload
     * @param rules - the rules
     */
    public async runRules( json: any, rules:any[]): Promise<string[]> {
        let destinations: string[];
        destinations = [];
        //run the json through the rules engine
        let engine = new Engine(rules);
        engine.addOperator('isLike', (factValue:any, rule:any) => {
            if (!factValue || !factValue.length || !rule.length){
                return false;
            }
            let escapeRegex = (rule:any) => rule.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            rule = rule.split("*").map(escapeRegex).join(".*");
            rule = "^" + rule + "$"
            let regex = new RegExp(rule);

            //Returns true if it finds a match, otherwise it returns false
            for( let i = 0; i < factValue.length; i++ ){
                if(regex.test(factValue[i])){
                    return true;
                }
            }
            return false;
        });
        engine.addFact("masterdata", json);
        await engine.run()
            .then(results => {
                results.events.map(event => {
                    if( event.params ) {
                        destinations = event.params.destination;
                    }
                })
            }
        );

        if (destinations.length === 0) {
            throw new ServiceError(new Error("Couldn't find a destination for message"), 2000);
        }

        return destinations;
    }
}