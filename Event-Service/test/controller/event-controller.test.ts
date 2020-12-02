/*
 * EPCIS MESSAGING HUB - EVENT SERVICE

 */

import {Pool} from "pg";
import {EventController} from '../../src/controller/event-controller';
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';

jest.mock('../../src/utils/common-utils', () => {
    const mLogger = {
        error: jest.fn((message) => console.log(message)),
        warn: jest.fn((message) => console.log(message)),
        info: jest.fn((message) => console.log(message))
    }

    const mCommonUtils = {
        //mock this so it returns the same ID for each test
        generateID: jest.fn(() => {
            return "123345-12345-12345";
        }),
        log: jest.fn((path: any) => {
            return mLogger;
        }),
        decodeBase64: jest.fn((value: string) => {
            return "somevalue";
        })
    };
    return {
        CommonUtils: jest.fn(() => mCommonUtils)
    };
});

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn().mockRejectedValueOnce(new Error()),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
    };
    return {
        Pool: jest.fn(() => mPool)
    };
});

jest.mock('amqplib/callback_api', () => {
    let mMsg = {
        properties:{
            contentType: "application/json",
            contentEncoding: "UTF-8",
            headers:{
                event_id: "12345-12345-12345",
                client_id: "678901-678901-678901",
                organization_id: 1
            }
        },
        fields: {
            deliveryTag: 1
        },
        content: '{"EPCISDocument":{"EPCISBody":{"EventList":{"ObjectEvent":{"eventTime":"2020-12-31T07:14:15Z","eventTimeZoneOffset":"+08:00","epcList":{"epc":["urn:epc:id:sgtin:9999555.600301.100000043583","urn:epc:id:sgtin:9999555.600301.100000043771","urn:epc:id:sgtin:9999555.600301.100000043207","urn:epc:id:sgtin:9999555.600301.100000043254","urn:epc:id:sgtin:9999555.600301.100000043301","urn:epc:id:sgtin:9999555.600301.100000043630","urn:epc:id:sgtin:9999555.600301.100000043677"]},"action":"ADD","bizStep":"sap:att:activity:18","disposition":"urn:epcglobal:cbv:disp:in_transit","readPoint":{"id":"(414)0300060000041(254)0"},"bizTransactionList":{"bizTransaction":"urn:epcglobal:cbv:bt:0300060000041:8216327422020"},"extension":{"sourceList":{"source":["(414)0300060000041(254)0","(414)0300060000041(254)0"]},"destinationList":{"destination":["(414)0300060000171(254)0","(414)0300060000171(254)0"]}}}}}}}'
    };
    const mChannel = {
        on: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean, deadLetterExchange: string}, callback: any) => callback(null, {
            "queue": "event-processor",
            "messageCount": 0,
            "consumerCount": 0
        }))
    };
    const mChannel2 = {
        on: jest.fn(),
        assertExchange: jest.fn(),
        publish: jest.fn((exch_name: string, route_key: string, content: any, options: any, callback: any) => callback(null, {ok: true})),
        assertQueue: jest.fn((queue_name: string, {durable: boolean}, callback: any) => callback(null, {
            "queue": "event-holding-local",
            "messageCount": 1,
            "consumerCount": 0
        })),
        bindQueue: jest.fn(),
        consume: jest.fn((queue, callback: any) => callback(mMsg)),
        nack: jest.fn(),
        prefetch: jest.fn(),
        connection: { close: jest.fn() }
    };
    const mConn = {
        createConfirmChannel: jest.fn((callback: any) => callback(null, mChannel)),
        createChannel: jest.fn((callback: any) => callback(null, mChannel2))
    };
    return {
        connect: jest.fn((obj: any, callback: any) => callback(null, mConn))
    };
});

const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'EventController\' ", () => {

    let pool: any;
    let ampq: any;
    let controller: EventController;

    let good_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043584</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let good_epcis_2 = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let good_epcis_3 = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
          <ObjectEvent>
          <eventTime>2020-12-02T07:14:15Z</eventTime>
          <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
          <epcList>
             <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
          </epcList>
          <action>ADD</action>
          <bizStep>sap:att:activity:18</bizStep>
          <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
          <readPoint>
             <id>(414)0300060000041(254)0</id>
          </readPoint>
          <bizTransactionList>
             <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
          </bizTransactionList>
       </ObjectEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let epcis_too_many_events = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let epcis_different_events = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
             <extension>
             <TransformationEvent>
             <eventTime>2013-10-31T14:58:56.591Z</eventTime>
             <eventTimeZoneOffset>+02:00</eventTimeZoneOffset>
             <inputEPCList>
             <epc>urn:epc:id:sgtin:4012345.011122.25</epc>
             <epc>urn:epc:id:sgtin:4000001.065432.99886655</epc>
             </inputEPCList>
             <inputQuantityList>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:4012345.011111.4444</epcClass>
             <quantity>10</quantity>
             <uom>KGM</uom>
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:0614141.077777.987</epcClass>
             <quantity>30</quantity>
             <!-- As the uom field has been omitted, 30 instances (e.g., pieces) of 
             GTIN '00614141777778' belonging to lot '987' have been used. -->
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:idpat:sgtin:4012345.066666.*</epcClass>
             <quantity>220</quantity>
             <!-- As the uom field has been omitted and as an EPC pattern is
             indicated, 220 instances (e.g., pieces) of GTIN '04012345666663' have been used. -->
             </quantityElement>
             </inputQuantityList>
             <outputEPCList>
             <epc>urn:epc:id:sgtin:4012345.077889.25</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.26</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.27</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.28</epc>
             </outputEPCList>
             <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
             <disposition>urn:epcglobal:cbv:disp:in_progress</disposition>
             <readPoint>
             <id>urn:epc:id:sgln:4012345.00001.0</id>
             </readPoint>
             </TransformationEvent>
             </extension>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let epcis_no_events = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let bad_epcis = '<?xml version="1.0" encoding="UTF-8"?><EPCISDoc><EPCISBody><EventList><ObjectEvent></ObjectEvent></EventList></EPCISBody></EPCISDoc>';

    let bad_xml = '<?xml version="1.0" encoding="UTF-8"?><EPCIS><EPCISBody><EventList><ObjectEvent></EventList></EPCISBody></EPCISDoc>';

    let aggregation_xml = '<?xml version="1.0" encoding="UTF-8"?><n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T11:42:23Z"><EPCISBody><EventList><AggregationEvent><eventTime>2020-05-29T11:42:23Z</eventTime><eventTimeZoneOffset>+01:00</eventTimeZoneOffset><parentID>urn:epc:id:sgtin:8806555.601781.100000002959</parentID><childEPCs><epc>urn:epc:id:sgtin:8806555.001781.100956328401</epc></childEPCs><action>DELETE</action><bizStep>sap:att:activity:16</bizStep><readPoint><id>(414)0300060000034(254)0</id></readPoint><bizLocation><id>(414)0300060000034(254)0</id></bizLocation></AggregationEvent></EventList></EPCISBody></n0:EPCISDocument>'
    let aggregation_xml2 =`<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <ObjectEvent>
                <eventTime>2020-12-02T07:14:15Z</eventTime>
                <eventTimeZoneOffset>+08:00</eventTimeZoneOffset>
                <epcList>
                   <epc>urn:epc:id:sgtin:9999555.600301.100000043583</epc>
                </epcList>
                <action>ADD</action>
                <bizStep>sap:att:activity:18</bizStep>
                <disposition>urn:epcglobal:cbv:disp:in_transit</disposition>
                <readPoint>
                   <id>(414)0300060000041(254)0</id>
                </readPoint>
                <bizTransactionList>
                   <bizTransaction type="urn:epcglobal:cbv:btt:desadv">urn:epcglobal:cbv:bt:0300060000041:8216327422020</bizTransaction>
                </bizTransactionList>
             </ObjectEvent>
             <AggregationEvent>
                <eventTime>2020-05-29T11:42:23Z</eventTime>
                <eventTimeZoneOffset>+01:00</eventTimeZoneOffset>
                <parentID>urn:epc:id:sgtin:8806555.601781.100000002959</parentID>
                <childEPCs>
                   <epc>urn:epc:id:sgtin:8806555.001781.100956328401</epc>
                </childEPCs>
                <action>DELETE</action>
                <bizStep>sap:att:activity:16</bizStep>
                <readPoint>
                   <id>(414)0300060000034(254)0</id>
                </readPoint>
                <bizLocation>
                   <id>(414)0300060000034(254)0</id>
                </bizLocation>
             </AggregationEvent>
             <extension>
             <TransformationEvent>
             <eventTime>2013-10-31T14:58:56.591Z</eventTime>
             <eventTimeZoneOffset>+02:00</eventTimeZoneOffset>
             <inputEPCList>
             <epc>urn:epc:id:sgtin:4012345.011122.25</epc>
             <epc>urn:epc:id:sgtin:4000001.065432.99886655</epc>
             </inputEPCList>
             <inputQuantityList>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:4012345.011111.4444</epcClass>
             <quantity>10</quantity>
             <uom>KGM</uom>
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:0614141.077777.987</epcClass>
             <quantity>30</quantity>
             <!-- As the uom field has been omitted, 30 instances (e.g., pieces) of 
             GTIN '00614141777778' belonging to lot '987' have been used. -->
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:idpat:sgtin:4012345.066666.*</epcClass>
             <quantity>220</quantity>
             <!-- As the uom field has been omitted and as an EPC pattern is
             indicated, 220 instances (e.g., pieces) of GTIN '04012345666663' have been used. -->
             </quantityElement>
             </inputQuantityList>
             <outputEPCList>
             <epc>urn:epc:id:sgtin:4012345.077889.25</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.26</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.27</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.28</epc>
             </outputEPCList>
             <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
             <disposition>urn:epcglobal:cbv:disp:in_progress</disposition>
             <readPoint>
             <id>urn:epc:id:sgln:4012345.00001.0</id>
             </readPoint>
             </TransformationEvent>
             </extension>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`;

    let aggregation_xml3 = `<?xml version="1.0" encoding="UTF-8"?>
    <n0:EPCISDocument xmlns:n0="urn:epcglobal:epcis:xsd:1" xmlns:n1="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" xmlns:prx="urn:sap.com:proxy:P1A:/1SAI/TAE4350B0DB1E861B094F2E:750" schemaVersion="1.1" creationDate="2020-05-29T07:14:15Z">
       <EPCISBody>
          <EventList>
             <extension>
             <TransformationEvent>
             <eventTime>2013-10-31T14:58:56.591Z</eventTime>
             <eventTimeZoneOffset>+02:00</eventTimeZoneOffset>
             <inputEPCList>
             <epc>urn:epc:id:sgtin:4012345.011122.25</epc>
             <epc>urn:epc:id:sgtin:4000001.065432.99886655</epc>
             </inputEPCList>
             <inputQuantityList>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:4012345.011111.4444</epcClass>
             <quantity>10</quantity>
             <uom>KGM</uom>
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:class:lgtin:0614141.077777.987</epcClass>
             <quantity>30</quantity>
             <!-- As the uom field has been omitted, 30 instances (e.g., pieces) of 
             GTIN '00614141777778' belonging to lot '987' have been used. -->
             </quantityElement>
             <quantityElement>
             <epcClass>urn:epc:idpat:sgtin:4012345.066666.*</epcClass>
             <quantity>220</quantity>
             <!-- As the uom field has been omitted and as an EPC pattern is
             indicated, 220 instances (e.g., pieces) of GTIN '04012345666663' have been used. -->
             </quantityElement>
             </inputQuantityList>
             <outputEPCList>
             <epc>urn:epc:id:sgtin:4012345.077889.25</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.26</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.27</epc>
             <epc>urn:epc:id:sgtin:4012345.077889.28</epc>
             </outputEPCList>
             <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
             <disposition>urn:epcglobal:cbv:disp:in_progress</disposition>
             <readPoint>
             <id>urn:epc:id:sgln:4012345.00001.0</id>
             </readPoint>
             </TransformationEvent>
             </extension>
                                   <AggregationEvent>
                <eventTime>2020-05-29T11:42:23Z</eventTime>
                <eventTimeZoneOffset>+01:00</eventTimeZoneOffset>
                <parentID>urn:epc:id:sgtin:8806555.601781.100000002959</parentID>
                <childEPCs>
                   <epc>urn:epc:id:sgtin:8806555.001781.100956328401</epc>
                </childEPCs>
                <action>DELETE</action>
                <bizStep>sap:att:activity:16</bizStep>
                <readPoint>
                   <id>(414)0300060000034(254)0</id>
                </readPoint>
                <bizLocation>
                   <id>(414)0300060000034(254)0</id>
                </bizLocation>
             </AggregationEvent>
          </EventList>
       </EPCISBody>
    </n0:EPCISDocument>`

    beforeAll(() => {
        jest.resetModules();
        jest.setTimeout(10000);

        //these values don't matter, they just have to be set
        process.env = {
            PGCERT: "",
            RABBITMQ_CERT: "",
            DATA_PRIVACY_RULES_SERVICE: "http://localhost:9000",
            ORGANIZATION_SERVICE: "http://localhost:9001",
            SEARCH_SERVICE: "http://localhost:9002",
            ALERT_SERVICE: "http://localhost:9003",
            EVENT_BFF: "https://messaging-hub.com",
            BLOCKCHAIN_LAB_ADAPTER_SERVICE: "http://blockchain-lab-adapter:8080"

        };
        pool = new Pool();
        controller = new EventController();
    });

    /** postEventForClient **/

    test('postEventForClient should 200 when all is good, no DPRs', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const callbackResponse = {
            callback: "https://messaging-hub.com/events/123345-12345-12345/status",
            message: "Processing",
            success: true
        };

        
        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": true,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, []);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('postEventForClient should 200 when all is good, with DPRs', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [
            {
                "id": 5,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc"
            }
        ];

        const callbackResponse = {
            callback: "https://messaging-hub.com/events/123345-12345-12345/status",
            message: "Accepted",
            success: true
        };

        pool.query.mockResolvedValueOnce({rows: [], rowCount: 0})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('postEventForClient should 200 when all is good, with DPRs, multiple redact', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis_2;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [
            {
                "id": 5,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 2,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc"
            },
            {
                "id": 6,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 1,
                "datafield_type": "object",
                "datafield_display": "BAD RULE",
                "datafield_path": "$..bad_rule"
            }
        ];

        const callbackResponse = {
            callback: "https://messaging-hub.com/events/123345-12345-12345/status",
            message: "Accepted",
            success: true
        };
        pool.query.mockResolvedValueOnce({rows: [{
            "id": 12,
            "events_paused": false,
            "masterdata_paused": false,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }], rowCount: 1})
        .mockResolvedValueOnce({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });


    test('postEventForClient should 200 when all is good, with DPRs', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis_3;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [
            {
                "id": 5,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 1,
                "datafield_type": "aggregation",
                "datafield_display": "Child EPC ID",
                "datafield_path": "$..epc"
            },
            {
                "id": 6,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 2,
                "datafield_type": "aggregation",
                "datafield_display": "Parent EPC ID",
                "datafield_path": "$..parentID"
            }
        ];

        const callbackResponse = {
            callback: "https://messaging-hub.com/events/123345-12345-12345/status",
            message: "Accepted",
            success: true
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('postEventForClient should 400 when xml is bad', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = bad_xml;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Invalid XML. Premature end of data in tag EPCIS line 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(500, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when xml has too many events', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = epcis_too_many_events;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Wrong number of events in XML payload. Found 2. Expected 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when aggregation event found', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = aggregation_xml;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Aggregation events are not supported."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    
    test('postEventForClient should 400 when aggregation event found with multiple events', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = aggregation_xml2;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Aggregation events are not supported."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when aggregation event found with transformation event', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = aggregation_xml3;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Aggregation events are not supported."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when xml has different events', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = epcis_different_events;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message:  "Wrong number of events in XML payload. Found 2. Expected 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when xml has no events', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = epcis_no_events;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "Wrong number of events in XML payload. Found 0. Expected 1."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when xml is invalid', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = bad_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const xmlResponse = {
            success: false,
            message: "XML doesn't comply with EPCIS standard. invalid xml (status=WITH_ERRORS) [error] cvc-elt.1.a: Cannot find the declaration of element 'EPCISDoc'. (1:49)."
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(xmlResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when user and org are undetermined', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(orgResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when data privacy fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Couldn't get data privacy rules from data-privacy-rules-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(400, dprResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('postEventForClient should 400 when search service fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        req.body = good_epcis_3;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = [
            {
                "id": 5,
                "organization_id": 1,
                "data_field": 3,
                "can_store": false,
                "order": 1,
                "datafield_type": "object",
                "datafield_display": "EPC",
                "datafield_path": "$..epc"
            }
        ];

        const callbackResponse = {
            success: false,
            message: "Couldn't post new event to search-service."
        };

        pool.query.mockResolvedValue({rows: [{status: "ok"}], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onGet(process.env.DATA_PRIVACY_RULES_SERVICE + "/organization/1/dataprivacyrules").reply(200, dprResponse);
        mock.onPost(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(500, {});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.postEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(callbackResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    /** getEventForClient **/

    test('getEventForClient should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const eventResponse = [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2014-04-01 15:19:49.31146+05:30",
                "client_id": "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc",
                "organization_id": 3,
                "type": "object",
                "action": "add",
                "source": "ATTP",
                "status": "on_ledger",
                "originalMessage": "<epcis:EPCISDocument xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\"schemaVersion=\"1.2\" creationDate=\"2012-03-29T17:10:16Z\"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>"
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            },
            {
                "destination_name": "Mock Adapter 2",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];

        const response = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "timestamp": "2014-04-01 15:19:49.31146+05:30",
            "client_id": "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc",
            "organization_id": 3,
            "type": "object",
            "action": "add",
            "source": "ATTP",
            "status": "on_ledger",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ],
            "originalMessage": "<epcis:EPCISDocument xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\"schemaVersion=\"1.2\" creationDate=\"2012-03-29T17:10:16Z\"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>"
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventForClient should 400 when org service fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "bad request"
        };

        const response = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventForClient should 404 when event is not found', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "no event found"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        pool.query.mockResolvedValue({rows: [], rowCount: 0})

        await controller.getEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getEventForClient should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "Couldn't retrieve event details from database"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getEventForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getEventForOrganization **/

    test('getEventForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2014-04-01 15:19:49.31146+05:30",
                "client_id": "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc",
                "organization_id": 3,
                "type": "object",
                "action": "add",
                "source": "ATTP",
                "status": "on_ledger",
                "originalMessage": "<epcis:EPCISDocument xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\"schemaVersion=\"1.2\" creationDate=\"2012-03-29T17:10:16Z\"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>"
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            },
            {
                "destination_name": "Mock Adapter 2",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];

        const response = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "timestamp": "2014-04-01 15:19:49.31146+05:30",
            "client_id": "7e2aee2e-f2e8-4dfc-a66a-bf2944ed08fc",
            "organization_id": 3,
            "type": "object",
            "action": "add",
            "source": "ATTP",
            "status": "on_ledger",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ],
            "originalMessage": "<epcis:EPCISDocument xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\"schemaVersion=\"1.2\" creationDate=\"2012-03-29T17:10:16Z\"><EPCISBody>...</EPCISBody></epcis:EPCISDocument>"
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventForOrganization should 404 when event is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no event found"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getEventForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve event details from database"
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getEventStatusForClient **/

    test('getEventStatusForClient should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const eventResponse = [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "on_ledger"
            }
        ];
        const eventDestinationResponse = [
            {
                "destination_name": "Mock Adapter",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            },
            {
                "destination_name": "Mock Adapter 2",
                "status": "on_ledger",
                "timestamp": "2020-08-14T16:16:10.099Z",
                "blockchain_response": "Got it thanks"
            }
        ];

        const response = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "status": "on_ledger",
            "destinations": [
                {
                    "destination_name": "Mock Adapter",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                },
                {
                    "destination_name": "Mock Adapter 2",
                    "status": "on_ledger",
                    "timestamp": "2020-08-14T16:16:10.099Z",
                    "blockchain_response": "Got it thanks"
                }
            ]
        };

        pool.query.mockResolvedValueOnce({rows: eventResponse, rowCount: eventResponse.length})
            .mockResolvedValueOnce({rows: eventDestinationResponse, rowCount: eventDestinationResponse.length})

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventStatusForClient should 400 when org service fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            success: false,
            message: "bad request"
        };

        const response = {
            success: false,
            message: "Couldn't get organization from organization-service."
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(400, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getEventStatusForClient should 404 when event is not found', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "no event found"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: [], rowCount: 0})

        await controller.getEventStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getEventStatusForClient should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const response = {
            success: false,
            message: "Couldn't retrieve event status from database"
        };

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getEventStatusForClient(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getDistinctEventSourcesForOrganization **/

    test('getDistinctEventSourcesForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const sourceResponse = [
            {
                source: "Source 1"
            },
            {
                source: "Source 2"
            },
            {
                source: "Source 3"
            }
        ]
        const response = ["Source 1", "Source 2", "Source 3"];

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: sourceResponse, rowCount: sourceResponse.length});

        await controller.getDistinctEventSourcesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDistinctEventSourcesForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve unique event sources from database"
        };

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getDistinctEventSourcesForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getDistinctEventDestinationsForOrganization **/

    test('getDistinctEventDestinationsForOrganization should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const destinationResponse = [
            {
                destination: "Destination 1"
            },
            {
                destination: "Destination 2"
            },
            {
                destination: "Destination 3"
            }
        ]
        const response = ["Destination 1", "Destination 2", "Destination 3"];

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockResolvedValue({rows: destinationResponse, rowCount: destinationResponse.length});

        await controller.getDistinctEventDestinationsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getDistinctEventDestinationsForOrganization should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = "1";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve unique event destinations from database"
        };

        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        pool.query.mockRejectedValue(new Error("bad query"));

        await controller.getDistinctEventDestinationsForOrganization(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    
    test('get EventQueue MessagesCount should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventResponse = {
            "queue": "event-processor",
            "messageCount": 1,
            "consumerCount": 0
        };
        await controller.getEventQueueMessagesCount(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith(eventResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Set Event queue status should 200 ', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            "id": 12,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        pool.query.mockResolvedValue({rows: [dprResponse], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Set Event queue status should 400 with missing request ', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing events_paused in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    
    test('Set Event queue status should 400 with missing request 2', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "events_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing masterdata_paused in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    
    test('Set Event queue status should 400 with missing request 3', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
        const request= {
            "masterdata_paused": true,
            "events_paused": false
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            success: false,
            message: "Missing updated_by in request"
        }

        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Set event queue status should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        const request= {
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin"
        }
        req.body = request;
        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't set the event processing queue status to database."
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.setEventQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('get queue status should 200 ', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse = {
            "id": 12,
            "events_paused": false,
            "masterdata_paused": true,
            "updated_by": "Hub UI admin",
            "timestamp": "2020-09-16T18:04:23.677Z"
        }

        pool.query.mockResolvedValue({rows: [dprResponse], rowCount: 1});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    
    test('get queue status should 200 when no result', async () => {
        const req = mockRequest();
        req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const orgResponse = {
            organization_id: 1,
            organization_name: "Test Org",
            source_name: "Test Source",
            client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
        };

        const dprResponse:any = []

        pool.query.mockResolvedValue({rows: [], rowCount: 0});
        mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);

        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(dprResponse);
        expect(res.status).toHaveBeenCalledWith(200);
    });
    

    test('Set queue status should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't get the processing queue status to database."
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getQueueStatus(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });


    /** getEventFromBlockchain **/
    test('getEventFromBlockchain should 200 when all is good', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventStatusResponse = [{
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "status": "on_ledger"
        }];

        const response = {
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "message": "test"
        };

        pool.query.mockResolvedValue({rows: eventStatusResponse, rowCount: 1});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960' ).reply(200, response);

        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getEventFromBlockchain should 404 when event is not found', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "no event found"
        };

        pool.query.mockResolvedValue({rows: [], rowCount: 0})
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960' ).reply(404, response);

        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getEventFromBlockchain should 500 when postgres query fails', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const response = {
            success: false,
            message: "Couldn't retrieve event status from database"
        };

        pool.query.mockRejectedValue(new Error("bad query"));
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getEventFromBlockchain should 500 when network errors', async () => {
        const req = mockRequest();
        req.params.orgId = 1;
        req.params.eventId = "0f49befb-84e2-45ef-b9ca-dc545787d960";
        req.params.adapterId = "blockchain-lab-adapter";

        const res = mockResponse();

        let mock = new MockAdapter(axios);

        const eventStatusResponse = [{
            "id": "0f49befb-84e2-45ef-b9ca-dc545787d960",
            "status": "on_ledger"
        }];

        const response = {
            success: false,
            message: "Error retrieving event from blockchain for event id 0f49befb-84e2-45ef-b9ca-dc545787d960 on blockchain blockchain-lab-adapter for org 1: Network Error"
        };

        pool.query.mockResolvedValue({rows: eventStatusResponse, rowCount: 1});
        mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});
        mock.onGet(process.env.BLOCKCHAIN_LAB_ADAPTER_SERVICE + '/adapter/organization/1/event/0f49befb-84e2-45ef-b9ca-dc545787d960' ).networkError();

        await controller.getEventFromBlockchain(req, res);

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send.mock.calls.length).toBe(1);
        expect(res.send).toHaveBeenCalledWith(response);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
});