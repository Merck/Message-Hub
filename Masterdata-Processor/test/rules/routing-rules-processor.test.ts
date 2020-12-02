/*
 * EPCIS MESSAGING HUB - MASTERDATA PROCESSOR

 */

import {RoutingRulesProcessor} from "../../src/rules/routing-rules-processor";

describe("Check class \'RoutingRulesProcessor\' ", () => {

    test('Run rules', done => {
        function callback(destinations:any) {
            expect(destinations === ["mock-adapter"])
            done();
        }

        let processor: RoutingRulesProcessor = new RoutingRulesProcessor();
        let rules = [{"conditions":{"any":[{"fact":"masterdata","path":"$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value","operator":"isLike","value":"100 Nowhere Street*"}]},"event":{"type":"destinations","params":{"destination":["mock-adapter"]}},"priority":1}];
        let json =  {"EPCISMasterDataDocument":{"schemaVersion":"1","creationDate":"2005-07-11T11:30:47.0Z","EPCISBody":{"VocabularyList":{"Vocabulary":[{"type":"urn:epcglobal:epcis:vtype:BusinessLocation","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epc:id:sgln:0037000.00729.0","attribute":[{"id":"urn:epcglobal:fmcg:mda:slt:retail"},{"id":"urn:epcglobal:fmcg:mda:latitude","value":"+18.0000"},{"id":"urn:epcglobal:fmcg:mda:longitude","value":"-70.0000"},{"value":"100 Nowhere Street, FancyCity 99999","id":"urn:epcglobal:fmcg:mda:address"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:201"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":{"id":"urn:epcglobal:fmcg:mda:sslt:202"}},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202,402","attribute":[{"id":"urn:epcglobal:fmcg:mda:sslt:202"},{"id":"urn:epcglobal:fmcg:mda:sslta:402"}]}]}},{"type":"urn:epcglobal:epcis:vtype:ReadPoint","VocabularyElementList":{"VocabularyElement":[{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.201","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:201"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.202","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:202"}]},{"id":"urn:epcglobal:fmcg:ssl:0037000.00729.203","attribute":[{"value":"urn:epc:id:sgln:0037000.00729.0","id":"urn:epcglobal:epcis:mda:site"},{"id":"urn:epcglobal:fmcg:mda:sslt:203"}]}]}}]}}}};
        processor.runRules(json, rules).then(callback);
    });
});