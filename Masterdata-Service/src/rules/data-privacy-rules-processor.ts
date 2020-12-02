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
 * EPCIS MESSAGING HUB - MASTERDATA SERVICE

 */

import path from "path";
import { CommonUtils } from "../utils/common-utils";
import axios from "axios";
import { Engine } from "json-rules-engine";
import { ErrorService } from '../services/error-service'
import { ServiceError } from "../errors/service-error";

let jp = require('jsonpath');

let commonUtils = new CommonUtils();
let logger = commonUtils.log(path.basename(__filename));

/**
 * This class is responsible for determining the destination based on the routing rules.
 */
export class DataPrivacyRulesProcessor {

    /**
     * Processor constructor
     */
    constructor() {
    }

    /**
     *
     * @param json
     * @param xml
     * @param organizationId
     */
    public async redact(json: any, xml: any, organizationId: number): Promise<void> {
        let rules = await this.getRulesForOrganization(organizationId, "masterdata");
        return this.runRules(json, xml, rules);
    }


    /**
     * Gets the rules for an organization by calling the routing-rules-service
     * TODO: This could be repetitive, think about caching the final rules
     *
     * @param organizationId
     * @param eventType
     */
    public async getRulesForOrganization(organizationId: number, eventType: string): Promise<any[]> {
        let rules: any[] = [];
        await axios.get(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/" + organizationId + "/dataprivacyrules")
            .then(results => {
                if (results.data) {
                    for (let i = 0; i < results.data.length; i++) {
                        let privacyRule = results.data[i];
                        if (eventType === privacyRule.datafield_type) {
                            let jsonRule = {
                                conditions: {
                                    any: [
                                        {
                                            fact: "event",
                                            path: privacyRule.datafield_path,
                                            operator: 'isLike',
                                            value: '*'
                                        }
                                    ]
                                },
                                event: {
                                    type: 'canstore',
                                    params: {
                                        path: privacyRule.datafield_path,
                                        xpath: privacyRule.datafield_xpath,
                                        canstore: privacyRule.can_store
                                    }
                                },
                                priority: (privacyRule.order > 0 ? privacyRule.order : 1)
                            };

                            rules.push(jsonRule);
                        }
                    }
                }
            }).catch(e => {
                ErrorService.reportError(organizationId, null, 4007, e.stack, null);
                throw new ServiceError(e, 4007);
            }
            );
        //logger.info("CONSTRUCTED RULES " + JSON.stringify(rules));
        return rules;
    }

    /**
     * Runs the rules against the json payload until a match is found
     *
     * @param json - the json payload
     * @param xml - the xml payload
     * @param rules - the rules
     */
    public async runRules(json: any, xml: any, rules: any[]): Promise<void> {

        //run the json through the rules engine
        let engine = new Engine(rules);

        engine.addOperator('isLike', (factValue: any, rule: any) => {
            if (!factValue || !factValue.length || !rule.length) {
                return false;
            }

            let escapeRegex = (rule: any) => rule.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            rule = rule.split("*").map(escapeRegex).join(".*");
            rule = "^" + rule + "$"
            let regex = new RegExp(rule);

            //Returns true if it finds a match, otherwise it returns false
            for (let i = 0; i < factValue.length; i++) {
                if (regex.test(factValue[i])) {
                    return true;
                }
            }
            return false;
        });

        engine.addFact("event", json);
        await engine.run()
            .then((results: any) => {
                results.events.map((event: any) => {
                    if (event.params) {
                        if (event.params.canstore === false) {
                            let path = event.params.path;

                            //redact the json at the path
                            let redeactedNodes = jp.nodes(json, path);
                            for (let i = 0; i < redeactedNodes.length; i++) {
                                //navigate down the paths to get to the json node
                                let parentNode = json;
                                for (let j = 1; j < redeactedNodes[i].path.length - 1; j++) {
                                    parentNode = parentNode[redeactedNodes[i].path[j]];
                                }
                                let redactedNodeName = redeactedNodes[i].path[redeactedNodes[i].path.length - 1];

                                //redact the json
                                if (Array.isArray(parentNode[redactedNodeName])) {
                                    parentNode[redactedNodeName] = [];
                                } else {
                                    parentNode[redactedNodeName] = '';
                                }
                            }

                            //redact the XML, use xpath in db. if not present, convert the jsonpath to a xpath
                            let xpath = undefined;
                            if (event.params.xpath && event.params.xpath !== null) {
                                xpath = event.params.xpath;
                            } else {
                                xpath = path.replace('$', '').split(".").join("/");
                                xpath = xpath.split("?(").join("").split(")").join("");
                                xpath = xpath.split("@/").join("@");
                                xpath = xpath.split("===").join("=").split("==").join("=");
                                xpath = xpath.split("/value").join("");
                            }
                            let xmlNodes = xml.find(xpath);
                            if (xmlNodes) {
                                for (let j = 0; j < xmlNodes.length; j++) {
                                    xmlNodes[j].remove();
                                }
                            }
                        }
                    }
                })
            }
            );
        //logger.info("REDACTED JSON " + JSON.stringify(json));
        //logger.info("REDACTED XML " + xml.toString());
    }
}