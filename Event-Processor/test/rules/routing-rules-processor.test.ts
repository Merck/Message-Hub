/*
 * EPCIS MESSAGING HUB - EVENT PROCESSOR
 */

import {RoutingRulesProcessor} from "../../src/rules/routing-rules-processor";

describe("Check class \'RoutingRulesProcessor\' ", () => {

    test('Run rules', done => {
        function callback(destinations:any) {
            expect(destinations === ["mock_adapter"])
            done();
        }

        let processor: RoutingRulesProcessor = new RoutingRulesProcessor();
        let rules = [{"conditions":{"any":[{"fact":"event","path":"$.epcisbody.eventlist.objectevent.epclist.epc","operator":"isLike","value":"urn:epc:id:sgtin:8806555.600301.*"}]},"event":{"type":"destinations","params":{"destination":["mock_adapter"]}},"priority":1},{"conditions":{"any":[{"fact":"event","path":"$.epcisbody.eventlist.objectevent.action","operator":"equal","value":"ADD"}]},"event":{"type":"destinations","params":{"destination":["test_adapter"]}},"priority":2},{"conditions":{"any":[{"fact":"event","path":"$.epcisbody.eventlist.objectevent.action","operator":"equal","value":"OBSERVE"}]},"event":{"type":"destinations","params":{"destination":["test_adapter3"]}},"priority":3},{"conditions":{"any":[{"fact":"event","path":"$.epcisbody.eventlist.objectevent.epclist.epc","operator":"isLike","value":"urn:epc:id:sgtin:9999*"}]},"event":{"type":"destinations","params":{"destination":["mock-adapter"]}},"priority":4},{"conditions":{"any":[{"fact":"event","path":"$.epcisbody.eventlist.aggregationevent.childepcs.epc","operator":"isLike","value":"urn:epc:id:sgtin:8806555.001781.*"}]},"event":{"type":"destinations","params":{"destination":["mock-adapter"]}},"priority":5}];
        let json =  {"epcisbody":{"eventlist":{"objectevent":{"eventtime":"2020-12-29T07:14:15Z","eventtimezoneoffset":"+08:00","epclist":{"epc":["urn:epc:id:sgtin:9906555.600301.100000043583","urn:epc:id:sgtin:9906555.600301.100000043771","urn:epc:id:sgtin:9906555.600301.100000043207","urn:epc:id:sgtin:9906555.600301.100000043254","urn:epc:id:sgtin:9906555.600301.100000043301","urn:epc:id:sgtin:9906555.600301.100000043630","urn:epc:id:sgtin:9906555.600301.100000043677","urn:epc:id:sgtin:9906555.600301.100000043724","urn:epc:id:sgtin:9906555.600301.100000043818","urn:epc:id:sgtin:9906555.600301.100000043865","urn:epc:id:sgtin:9906555.600301.100000043912","urn:epc:id:sgtin:9906555.600301.100000042690","urn:epc:id:sgtin:9906555.600301.100000042972","urn:epc:id:sgtin:9906555.600301.100000043395","urn:epc:id:sgtin:9906555.600301.100000043019","urn:epc:id:sgtin:9906555.600301.100000043066","urn:epc:id:sgtin:9906555.600301.100000043113","urn:epc:id:sgtin:9906555.600301.100000043442","urn:epc:id:sgtin:9906555.600301.100000043489","urn:epc:id:sgtin:8806555.600301.100000043536","urn:epc:id:sgtin:9906555.600301.100000042737","urn:epc:id:sgtin:9906555.600301.100000042784","urn:epc:id:sgtin:9906555.600301.100000042831","urn:epc:id:sgtin:9906555.600301.100000042925","urn:epc:id:sgtin:9906555.600301.100000045932","urn:epc:id:sgtin:9906555.600301.100000045885","urn:epc:id:sgtin:9906555.600301.100000045556","urn:epc:id:sgtin:9906555.600301.100000045509","urn:epc:id:sgtin:9906555.600301.100000043160"]},"action":"OBSERVE","bizstep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readpoint":{"id":"(414)0300060000041(254)0"},"biztransactionlist":{"biztransaction":{"_":"urn:epcglobal:cbv:bt:0300060000041:8216327422020","type":"urn:epcglobal:cbv:btt:desadv"}},"extension":{"sourcelist":{"source":[{"_":"(414)0300060000041(254)0","type":"urn:epcglobal:cbv:sdt:owning_party"},{"_":"(414)0300060000041(254)0","type":"urn:epcglobal:cbv:sdt:location"}]},"destinationlist":{"destination":[{"_":"(414)0300060000171(254)0","type":"urn:epcglobal:cbv:sdt:owning_party"},{"_":"(414)0300060000171(254)0","type":"urn:epcglobal:cbv:sdt:location"}]}}}}}};
        processor.runRules(json, rules).then(callback);
    });
});
