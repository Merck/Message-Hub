/*
 * EPCIS MESSAGING HUB - QUERY SERVICE

 */

import {QueryController} from '../../src/controller/query-controller';
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


const {mockRequest, mockResponse} = require('../utils/interceptor');


describe("Check class \'QueryController\' ", () => {

    let controller: QueryController;

    let good_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    <param>
    <name>MATCH_epc</name>
    <value>
    <string>urn:epc:id:sgln:1414141.12945.32a%2Fb</string>
    </value>
    </param>
    <param>
    <name>EQ_action</name>
    <value>
    <string>ADD</string>
    </value>
    </param>
    <param>
    <name>GE_eventTime</name>
    <value>
    <string>2020-11-01T10:28:08.717Z</string>
    </value>
    </param>
    <param>
    <name>LT_eventTime</name>
    <value>
    <string>2020-11-02T10:28:08.717Z</string>
    </value>
    </param>
    <param>
    <name>EQ_disposition</name>
    <value>
    <string>urn:epcglobal:cbv:disp:active</string>
    </value>
    </param>
    <param>
    <name>EQ_readPoint</name>
    <value>
    <string></string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let invalidxml_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let invalidqueryxml_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll>
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let good_oneparam_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let queryName_missing_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName></queryName>
    <params>
    <param>
    <name>eventType</name>
    <value>
    <string>ObjectEvent</string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    
    let missing_queryparams_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let notsearchable_queryparams_epcis = `<?xml version="1.0" encoding="UTF-8"?>
    <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" schemaVersion="1.1" creationDate="2015-04-14T11:14:25.411-04:00">
    <EPCISBody>
    <epcisq:Poll xmlns:epcisq="urn:epcglobal:epcis-query:xsd:1">
    <queryName>SimpleEventQuery</queryName>
    <params>
    <param>
    <name>EQ_disposition</name>
    <value>
    <string>urn:epcglobal:cbv:disp:active</string>
    </value>
    </param>
    </params>
    </epcisq:Poll>
    </EPCISBody>
    </epcis:EPCISDocument>`;

    let epics_response = `<?xml version=\"1.0\" encoding=\"UTF-8\"?><epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\"><EPCISBody><epcisq:QueryResults xmlns:epcisq=\"urn:epcglobal:epcis-query:xsd:1\"><queryName>SimpleEventQuery</queryName><resultsBody><EventList><ObjectEvent><eventTime>2020-11-01T10:28:08.717Z</eventTime>
    <eventTimeZoneOffset>-05:00</eventTimeZoneOffset>
    <epcList>
            <epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>·
    </epcList>
    <action>ADD</action>
    <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
    <disposition>urn:epcglobal:cbv:disp:active</disposition>
    <readPoint>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </readPoint>
    <bizLocation>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </bizLocation>
    <extension>
            <ilmd>
                    <cbvmda:lotNumber>LOT123</cbvmda:lotNumber>
                    <cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>
            </ilmd>
    </extension></ObjectEvent><ObjectEvent><eventTime>2020-11-01T10:28:08.717Z</eventTime>
    <eventTimeZoneOffset>-05:00</eventTimeZoneOffset>
    <epcList>
            <epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>·
    </epcList>
    <action>ADD</action>
    <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
    <disposition>urn:epcglobal:cbv:disp:active</disposition>
    <readPoint>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </readPoint>
    <bizLocation>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </bizLocation>
    <extension>
            <ilmd>
                    <cbvmda:lotNumber>LOT123</cbvmda:lotNumber>
                    <cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>
            </ilmd>
    </extension></ObjectEvent></EventList></resultsBody></epcisq:QueryResults></EPCISBody></epcis:EPCISDocument>`

    let epics_single_response = `<?xml version=\"1.0\" encoding=\"UTF-8\"?><epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\"><EPCISBody><epcisq:QueryResults xmlns:epcisq=\"urn:epcglobal:epcis-query:xsd:1\"><queryName>SimpleEventQuery</queryName><resultsBody><EventList><ObjectEvent><eventTime>2020-11-01T10:28:08.717Z</eventTime><eventTimeZoneOffset>-05:00</eventTimeZoneOffset><epcList>
            <epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>·
    </epcList>
    <action>ADD</action>
    <bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>
    <disposition>urn:epcglobal:cbv:disp:active</disposition>
    <readPoint>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </readPoint>
    <bizLocation>
            <id>urn:epc:id:sgln:036800.111111.0</id>
    </bizLocation>
    <extension>
            <ilmd>
                    <cbvmda:lotNumber>LOT123</cbvmda:lotNumber>
                    <cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>
            </ilmd>
    </extension></ObjectEvent></EventList></resultsBody></epcisq:QueryResults></EPCISBody></epcis:EPCISDocument>`

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
            QUERY_BFF: "https://messaging-hub.com"

        };
        controller = new QueryController();
    });

    describe("Check class \'QueryController\'", () => {
        /** postQueryForClient **/

        test('postQueryForClient should 200 when all is good,', async () => {
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
            const searchResp = {"totalResults":2,"results":[{"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"},{"id":"31a44072-d3a0-4ff1-b103-d862eba44c9c","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"}],"sort":[{"timestamp":{"order":"desc"}}]}
            const event1Resp= {"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","timestamp":"2020-11-01T10:28:08.717Z","client_id":"6c17d9ce-a7f2-4422-8205-023e2d76ee7f","organization_id":1,"type":"object","action":"add","source":"System 1 for Org 1","status":"accepted","xml_data":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\">\n\t<EPCISHeader>\n\t\t<sbdh:StandardBusinessDocumentHeader>\n\t\t\t<sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>\n\t\t\t<sbdh:Sender>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:036800.111111.0</sbdh:Identifier>\n\t\t\t</sbdh:Sender>\n\t\t\t<sbdh:Receiver>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:0716163.01122.0</sbdh:Identifier>\n\t\t\t</sbdh:Receiver>\n\t\t\t<sbdh:DocumentIdentification>\n\t\t\t\t<sbdh:Standard>EPCglobal</sbdh:Standard>\n\t\t\t\t<sbdh:TypeVersion>1.0</sbdh:TypeVersion>\n\t\t\t\t<sbdh:InstanceIdentifier>1234567890</sbdh:InstanceIdentifier>\n\t\t\t\t<sbdh:Type>Events</sbdh:Type>\n\t\t\t\t<sbdh:CreationDateAndTime>2018-05-01T12:10:16Z</sbdh:CreationDateAndTime>\n\t\t\t</sbdh:DocumentIdentification>\n\t\t</sbdh:StandardBusinessDocumentHeader>\n\t\t<extension>\n\t\t\t<EPCISMasterData>\n\t\t\t\t<VocabularyList>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:EPCClass\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:idpat:sgtin:036800.0012345.*\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\">68000012345</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\">FDA_NDC_11</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#regulatedProductName\">My Drug</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#dosageFormType\">PILL</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#strengthDescription\">100mg</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#netContentDescription\">500</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:Location\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:id:sgln:036800.111111.0\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#name\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressOne\">3575 Zumstein Ave</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressTwo\">Suite 101</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#city\">Washington</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#state\">DC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#postalCode\">12345-6789</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#countryCode\">US</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t</VocabularyList>\n\t\t\t</EPCISMasterData>\n\t\t</extension>\n\t</EPCISHeader>\n\t<EPCISBody>\n\t\t<EventList>\n\t\t\t<ObjectEvent>\n\t\t\t\t<eventTime>2020-11-01T10:28:08.717Z</eventTime>\n\t\t\t\t<eventTimeZoneOffset>-05:00</eventTimeZoneOffset>\n\t\t\t\t<epcList>\n\t\t\t\t\t<epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>\n\n\t\t\t\t</epcList>\n\t\t\t\t<action>ADD</action>\n\t\t\t\t<bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>\n\t\t\t\t<disposition>urn:epcglobal:cbv:disp:active</disposition>\n\t\t\t\t<readPoint>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</readPoint>\n\t\t\t\t<bizLocation>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</bizLocation>\n\t\t\t\t<extension>\n\t\t\t\t\t<ilmd>\n\t\t\t\t\t\t<cbvmda:lotNumber>LOT123</cbvmda:lotNumber>\n\t\t\t\t\t\t<cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>\n\t\t\t\t\t</ilmd>\n\t\t\t\t</extension>\n\t\t\t</ObjectEvent>\n\t\t</EventList>\n\t</EPCISBody>\n</epcis:EPCISDocument>\n","json_data":"{\"epcis:EPCISDocument\":{\"xmlns:cbvmda\":\"urn:epcglobal:cbv:mda\",\"xmlns:epcis\":\"urn:epcglobal:epcis:xsd:1\",\"xmlns:sbdh\":\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\",\"schemaVersion\":\"1.2\",\"creationDate\":\"2012-03-25T17:10:16Z\",\"EPCISHeader\":{\"sbdh:StandardBusinessDocumentHeader\":{\"sbdh:HeaderVersion\":\"1.0\",\"sbdh:Sender\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:036800.111111.0\",\"Authority\":\"SGLN\"}},\"sbdh:Receiver\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:0716163.01122.0\",\"Authority\":\"SGLN\"}},\"sbdh:DocumentIdentification\":{\"sbdh:Standard\":\"EPCglobal\",\"sbdh:TypeVersion\":\"1.0\",\"sbdh:InstanceIdentifier\":\"1234567890\",\"sbdh:Type\":\"Events\",\"sbdh:CreationDateAndTime\":\"2018-05-01T12:10:16Z\"}},\"extension\":{\"EPCISMasterData\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:EPCClass\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:idpat:sgtin:036800.0012345.*\",\"attribute\":[{\"value\":\"68000012345\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\"},{\"value\":\"FDA_NDC_11\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\"},{\"value\":\"My Drug\",\"id\":\"urn:epcglobal:cbv:mda#regulatedProductName\"},{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\"},{\"value\":\"PILL\",\"id\":\"urn:epcglobal:cbv:mda#dosageFormType\"},{\"value\":\"100mg\",\"id\":\"urn:epcglobal:cbv:mda#strengthDescription\"},{\"value\":\"500\",\"id\":\"urn:epcglobal:cbv:mda#netContentDescription\"}]}}},{\"type\":\"urn:epcglobal:epcis:vtype:Location\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\",\"attribute\":[{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#name\"},{\"value\":\"3575 Zumstein Ave\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressOne\"},{\"value\":\"Suite 101\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressTwo\"},{\"value\":\"Washington\",\"id\":\"urn:epcglobal:cbv:mda#city\"},{\"value\":\"DC\",\"id\":\"urn:epcglobal:cbv:mda#state\"},{\"value\":\"12345-6789\",\"id\":\"urn:epcglobal:cbv:mda#postalCode\"},{\"value\":\"US\",\"id\":\"urn:epcglobal:cbv:mda#countryCode\"}]}}}]}}}},\"EPCISBody\":{\"EventList\":{\"ObjectEvent\":{\"eventTime\":\"2020-11-01T10:28:08.717Z\",\"eventTimeZoneOffset\":\"-05:00\",\"epcList\":{\"epc\":\"urn:epc:id:sgln:1414141.12945.32a%2Fb\"},\"action\":\"ADD\",\"bizStep\":\"urn:epcglobal:cbv:bizstep:commissioning\",\"disposition\":\"urn:epcglobal:cbv:disp:active\",\"readPoint\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"bizLocation\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"extension\":{\"ilmd\":{\"cbvmda:lotNumber\":\"LOT123\",\"cbvmda:itemExpirationDate\":\"2020-12-31\"}}}}}}}"}
            const event2Resp = {"id":"31a44072-d3a0-4ff1-b103-d862eba44c9c","timestamp":"2020-11-01T10:28:08.717Z","client_id":"6c17d9ce-a7f2-4422-8205-023e2d76ee7f","organization_id":1,"type":"object","action":"add","source":"System 1 for Org 1","status":"accepted","xml_data":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\">\n\t<EPCISHeader>\n\t\t<sbdh:StandardBusinessDocumentHeader>\n\t\t\t<sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>\n\t\t\t<sbdh:Sender>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:036800.111111.0</sbdh:Identifier>\n\t\t\t</sbdh:Sender>\n\t\t\t<sbdh:Receiver>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:0716163.01122.0</sbdh:Identifier>\n\t\t\t</sbdh:Receiver>\n\t\t\t<sbdh:DocumentIdentification>\n\t\t\t\t<sbdh:Standard>EPCglobal</sbdh:Standard>\n\t\t\t\t<sbdh:TypeVersion>1.0</sbdh:TypeVersion>\n\t\t\t\t<sbdh:InstanceIdentifier>1234567890</sbdh:InstanceIdentifier>\n\t\t\t\t<sbdh:Type>Events</sbdh:Type>\n\t\t\t\t<sbdh:CreationDateAndTime>2018-05-01T12:10:16Z</sbdh:CreationDateAndTime>\n\t\t\t</sbdh:DocumentIdentification>\n\t\t</sbdh:StandardBusinessDocumentHeader>\n\t\t<extension>\n\t\t\t<EPCISMasterData>\n\t\t\t\t<VocabularyList>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:EPCClass\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:idpat:sgtin:036800.0012345.*\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\">68000012345</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\">FDA_NDC_11</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#regulatedProductName\">My Drug</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#dosageFormType\">PILL</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#strengthDescription\">100mg</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#netContentDescription\">500</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:Location\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:id:sgln:036800.111111.0\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#name\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressOne\">3575 Zumstein Ave</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressTwo\">Suite 101</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#city\">Washington</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#state\">DC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#postalCode\">12345-6789</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#countryCode\">US</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t</VocabularyList>\n\t\t\t</EPCISMasterData>\n\t\t</extension>\n\t</EPCISHeader>\n\t<EPCISBody>\n\t\t<EventList>\n\t\t\t<ObjectEvent>\n\t\t\t\t<eventTime>2020-11-01T10:28:08.717Z</eventTime>\n\t\t\t\t<eventTimeZoneOffset>-05:00</eventTimeZoneOffset>\n\t\t\t\t<epcList>\n\t\t\t\t\t<epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>\n\n\t\t\t\t</epcList>\n\t\t\t\t<action>ADD</action>\n\t\t\t\t<bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>\n\t\t\t\t<disposition>urn:epcglobal:cbv:disp:active</disposition>\n\t\t\t\t<readPoint>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</readPoint>\n\t\t\t\t<bizLocation>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</bizLocation>\n\t\t\t\t<extension>\n\t\t\t\t\t<ilmd>\n\t\t\t\t\t\t<cbvmda:lotNumber>LOT123</cbvmda:lotNumber>\n\t\t\t\t\t\t<cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>\n\t\t\t\t\t</ilmd>\n\t\t\t\t</extension>\n\t\t\t</ObjectEvent>\n\t\t</EventList>\n\t</EPCISBody>\n</epcis:EPCISDocument>\n","json_data":"{\"epcis:EPCISDocument\":{\"xmlns:cbvmda\":\"urn:epcglobal:cbv:mda\",\"xmlns:epcis\":\"urn:epcglobal:epcis:xsd:1\",\"xmlns:sbdh\":\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\",\"schemaVersion\":\"1.2\",\"creationDate\":\"2012-03-25T17:10:16Z\",\"EPCISHeader\":{\"sbdh:StandardBusinessDocumentHeader\":{\"sbdh:HeaderVersion\":\"1.0\",\"sbdh:Sender\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:036800.111111.0\",\"Authority\":\"SGLN\"}},\"sbdh:Receiver\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:0716163.01122.0\",\"Authority\":\"SGLN\"}},\"sbdh:DocumentIdentification\":{\"sbdh:Standard\":\"EPCglobal\",\"sbdh:TypeVersion\":\"1.0\",\"sbdh:InstanceIdentifier\":\"1234567890\",\"sbdh:Type\":\"Events\",\"sbdh:CreationDateAndTime\":\"2018-05-01T12:10:16Z\"}},\"extension\":{\"EPCISMasterData\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:EPCClass\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:idpat:sgtin:036800.0012345.*\",\"attribute\":[{\"value\":\"68000012345\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\"},{\"value\":\"FDA_NDC_11\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\"},{\"value\":\"My Drug\",\"id\":\"urn:epcglobal:cbv:mda#regulatedProductName\"},{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\"},{\"value\":\"PILL\",\"id\":\"urn:epcglobal:cbv:mda#dosageFormType\"},{\"value\":\"100mg\",\"id\":\"urn:epcglobal:cbv:mda#strengthDescription\"},{\"value\":\"500\",\"id\":\"urn:epcglobal:cbv:mda#netContentDescription\"}]}}},{\"type\":\"urn:epcglobal:epcis:vtype:Location\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\",\"attribute\":[{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#name\"},{\"value\":\"3575 Zumstein Ave\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressOne\"},{\"value\":\"Suite 101\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressTwo\"},{\"value\":\"Washington\",\"id\":\"urn:epcglobal:cbv:mda#city\"},{\"value\":\"DC\",\"id\":\"urn:epcglobal:cbv:mda#state\"},{\"value\":\"12345-6789\",\"id\":\"urn:epcglobal:cbv:mda#postalCode\"},{\"value\":\"US\",\"id\":\"urn:epcglobal:cbv:mda#countryCode\"}]}}}]}}}},\"EPCISBody\":{\"EventList\":{\"ObjectEvent\":{\"eventTime\":\"2020-11-01T10:28:08.717Z\",\"eventTimeZoneOffset\":\"-05:00\",\"epcList\":{\"epc\":\"urn:epc:id:sgln:1414141.12945.32a%2Fb\"},\"action\":\"ADD\",\"bizStep\":\"urn:epcglobal:cbv:bizstep:commissioning\",\"disposition\":\"urn:epcglobal:cbv:disp:active\",\"readPoint\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"bizLocation\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"extension\":{\"ilmd\":{\"cbvmda:lotNumber\":\"LOT123\",\"cbvmda:itemExpirationDate\":\"2020-12-31\"}}}}}}}"}
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/da2706dd-c540-4ebb-86f3-dc5b7aaa77a2").reply(200, event1Resp)
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/31a44072-d3a0-4ff1-b103-d862eba44c9c").reply(200, event2Resp)
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('postQueryForClient should 400 when user and org are undetermined', async () => {
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
    
            await controller.postQueryForClient(req, res);
            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(orgResponse);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when  search service fails,', async () => {
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
            const searchResp = {success: false, message: "Error when searching the event from the search service for the organization id 1. Error: Network Error"};
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").networkError();
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(searchResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when invalid epcis xml', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = invalidxml_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errorResp = {success: false, message: "Invalid XML. Extra content at the end of the document."};
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errorResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when invalid epcis query xml', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = invalidqueryxml_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errorResp = {success: false, message: "XML doesn't comply with EPCIS standard. invalid xml (status=FATAL_ERROR) [fatal] The prefix \"epcisq\" for element \"epcisq:Poll\" is not bound. (4:18) [fatal] The prefix \"epcisq\" for element \"epcisq:Poll\" is not bound.."};
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errorResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        
        test('postQueryForClient should 200 when all is good for one query param,', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = good_oneparam_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const searchResp = {"totalResults":1,"results":[{"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"}],"sort":[{"timestamp":{"order":"desc"}}]}
            const event1Resp= {"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","timestamp":"2020-11-01T10:28:08.717Z","client_id":"6c17d9ce-a7f2-4422-8205-023e2d76ee7f","organization_id":1,"type":"object","action":"add","source":"System 1 for Org 1","status":"accepted","xml_data":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\">\n\t<EPCISHeader>\n\t\t<sbdh:StandardBusinessDocumentHeader>\n\t\t\t<sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>\n\t\t\t<sbdh:Sender>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:036800.111111.0</sbdh:Identifier>\n\t\t\t</sbdh:Sender>\n\t\t\t<sbdh:Receiver>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:0716163.01122.0</sbdh:Identifier>\n\t\t\t</sbdh:Receiver>\n\t\t\t<sbdh:DocumentIdentification>\n\t\t\t\t<sbdh:Standard>EPCglobal</sbdh:Standard>\n\t\t\t\t<sbdh:TypeVersion>1.0</sbdh:TypeVersion>\n\t\t\t\t<sbdh:InstanceIdentifier>1234567890</sbdh:InstanceIdentifier>\n\t\t\t\t<sbdh:Type>Events</sbdh:Type>\n\t\t\t\t<sbdh:CreationDateAndTime>2018-05-01T12:10:16Z</sbdh:CreationDateAndTime>\n\t\t\t</sbdh:DocumentIdentification>\n\t\t</sbdh:StandardBusinessDocumentHeader>\n\t\t<extension>\n\t\t\t<EPCISMasterData>\n\t\t\t\t<VocabularyList>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:EPCClass\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:idpat:sgtin:036800.0012345.*\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\">68000012345</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\">FDA_NDC_11</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#regulatedProductName\">My Drug</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#dosageFormType\">PILL</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#strengthDescription\">100mg</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#netContentDescription\">500</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:Location\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:id:sgln:036800.111111.0\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#name\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressOne\">3575 Zumstein Ave</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressTwo\">Suite 101</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#city\">Washington</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#state\">DC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#postalCode\">12345-6789</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#countryCode\">US</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t</VocabularyList>\n\t\t\t</EPCISMasterData>\n\t\t</extension>\n\t</EPCISHeader>\n\t<EPCISBody>\n\t\t<EventList>\n\t\t\t<ObjectEvent>\n\t\t\t\t<eventTime>2020-11-01T10:28:08.717Z</eventTime>\n\t\t\t\t<eventTimeZoneOffset>-05:00</eventTimeZoneOffset>\n\t\t\t\t<epcList>\n\t\t\t\t\t<epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>\n\n\t\t\t\t</epcList>\n\t\t\t\t<action>ADD</action>\n\t\t\t\t<bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>\n\t\t\t\t<disposition>urn:epcglobal:cbv:disp:active</disposition>\n\t\t\t\t<readPoint>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</readPoint>\n\t\t\t\t<bizLocation>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</bizLocation>\n\t\t\t\t<extension>\n\t\t\t\t\t<ilmd>\n\t\t\t\t\t\t<cbvmda:lotNumber>LOT123</cbvmda:lotNumber>\n\t\t\t\t\t\t<cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>\n\t\t\t\t\t</ilmd>\n\t\t\t\t</extension>\n\t\t\t</ObjectEvent>\n\t\t</EventList>\n\t</EPCISBody>\n</epcis:EPCISDocument>\n","json_data":"{\"epcis:EPCISDocument\":{\"xmlns:cbvmda\":\"urn:epcglobal:cbv:mda\",\"xmlns:epcis\":\"urn:epcglobal:epcis:xsd:1\",\"xmlns:sbdh\":\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\",\"schemaVersion\":\"1.2\",\"creationDate\":\"2012-03-25T17:10:16Z\",\"EPCISHeader\":{\"sbdh:StandardBusinessDocumentHeader\":{\"sbdh:HeaderVersion\":\"1.0\",\"sbdh:Sender\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:036800.111111.0\",\"Authority\":\"SGLN\"}},\"sbdh:Receiver\":{\"sbdh:Identifier\":{\"value\":\"urn:epc:id:sgln:0716163.01122.0\",\"Authority\":\"SGLN\"}},\"sbdh:DocumentIdentification\":{\"sbdh:Standard\":\"EPCglobal\",\"sbdh:TypeVersion\":\"1.0\",\"sbdh:InstanceIdentifier\":\"1234567890\",\"sbdh:Type\":\"Events\",\"sbdh:CreationDateAndTime\":\"2018-05-01T12:10:16Z\"}},\"extension\":{\"EPCISMasterData\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:EPCClass\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:idpat:sgtin:036800.0012345.*\",\"attribute\":[{\"value\":\"68000012345\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\"},{\"value\":\"FDA_NDC_11\",\"id\":\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\"},{\"value\":\"My Drug\",\"id\":\"urn:epcglobal:cbv:mda#regulatedProductName\"},{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\"},{\"value\":\"PILL\",\"id\":\"urn:epcglobal:cbv:mda#dosageFormType\"},{\"value\":\"100mg\",\"id\":\"urn:epcglobal:cbv:mda#strengthDescription\"},{\"value\":\"500\",\"id\":\"urn:epcglobal:cbv:mda#netContentDescription\"}]}}},{\"type\":\"urn:epcglobal:epcis:vtype:Location\",\"VocabularyElementList\":{\"VocabularyElement\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\",\"attribute\":[{\"value\":\"My Pharma LLC\",\"id\":\"urn:epcglobal:cbv:mda#name\"},{\"value\":\"3575 Zumstein Ave\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressOne\"},{\"value\":\"Suite 101\",\"id\":\"urn:epcglobal:cbv:mda#streetAddressTwo\"},{\"value\":\"Washington\",\"id\":\"urn:epcglobal:cbv:mda#city\"},{\"value\":\"DC\",\"id\":\"urn:epcglobal:cbv:mda#state\"},{\"value\":\"12345-6789\",\"id\":\"urn:epcglobal:cbv:mda#postalCode\"},{\"value\":\"US\",\"id\":\"urn:epcglobal:cbv:mda#countryCode\"}]}}}]}}}},\"EPCISBody\":{\"EventList\":{\"ObjectEvent\":{\"eventTime\":\"2020-11-01T10:28:08.717Z\",\"eventTimeZoneOffset\":\"-05:00\",\"epcList\":{\"epc\":\"urn:epc:id:sgln:1414141.12945.32a%2Fb\"},\"action\":\"ADD\",\"bizStep\":\"urn:epcglobal:cbv:bizstep:commissioning\",\"disposition\":\"urn:epcglobal:cbv:disp:active\",\"readPoint\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"bizLocation\":{\"id\":\"urn:epc:id:sgln:036800.111111.0\"},\"extension\":{\"ilmd\":{\"cbvmda:lotNumber\":\"LOT123\",\"cbvmda:itemExpirationDate\":\"2020-12-31\"}}}}}}}"}
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/da2706dd-c540-4ebb-86f3-dc5b7aaa77a2").reply(200, event1Resp);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('postQueryForClient should 400 when query name is missing,', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = queryName_missing_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errResp = {success: false, message: "XML doesn't contain Query name."}
            
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when query params missing,', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = missing_queryparams_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errResp = {success: false, message: "XML doesn't contain Query params."}
            
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when query params with not searchable,', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = notsearchable_queryparams_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errResp = {success: false, message: "XML doesn't contain required/supported Query params to search for Event XML."}
            
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 200 when all is good for one query param but no event found in search service', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = good_oneparam_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const searchResp = {"totalResults":0,"results":[]};
            const resp = {success: false, message: "No events match for the query params provided in the Query XML."}
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(resp);
            expect(res.status).toHaveBeenCalledWith(200);
        });
                
        test('postQueryForClient should 400 for one query param but no xml data from event service', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = good_oneparam_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const resp = {success: false, message: "No Event XMLs found from the event service for matching event ids matched for the organization 1."}
            const searchResp = {"totalResults":1,"results":[{"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"}],"sort":[{"timestamp":{"order":"desc"}}]}
            const event1Resp= {};
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/da2706dd-c540-4ebb-86f3-dc5b7aaa77a2").reply(200, event1Resp);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(resp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        
        test('postQueryForClient should 400 for one query param but error from event service', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = good_oneparam_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const resp = {success: false, message: "Unable to get the event xmls from the event service for the organization 1. Error: Network Error"}
            const searchResp = {"totalResults":1,"results":[{"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"}],"sort":[{"timestamp":{"order":"desc"}}]}
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/da2706dd-c540-4ebb-86f3-dc5b7aaa77a2").networkError();
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(resp);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('postQueryForClient should 400 when error while parsing the event response from event service', async () => {
            const req = mockRequest();
            req.params.clientId = "5732c502-abbb-4b57-9f48-1b077b8d9b4d";
            req.body = good_oneparam_epcis;
            const res = mockResponse();

            let mock = new MockAdapter(axios);

            const orgResponse = {
                organization_id: 1,
                organization_name: "Test Org",
                source_name: "Test Source",
                client_id: "5732c502-abbb-4b57-9f48-1b077b8d9b4d"
            };
            const errorResp = {success: false, message: "Error returned while preparing the EPCIS Query Results XML for the organization 1. SyntaxError: Unexpected token e in JSON at position 0"}
            const searchResp = {"totalResults":1,"results":[{"id":"da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","textids":["urn:epc:id:sgln:1414141.12945.32a%2Fb"],"timestamp":"2020-11-01T10:28:08.717Z","type":"object","action":"add"}],"sort":[{"timestamp":{"order":"desc"}}]}
            const event1Resp= {"id": "da2706dd-c540-4ebb-86f3-dc5b7aaa77a2","timestamp": "2020-11-01T10:28:08.717Z","client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f","organization_id": 1,"type": "object","action": "add","xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<epcis:EPCISDocument xmlns:cbvmda=\"urn:epcglobal:cbv:mda\" xmlns:epcis=\"urn:epcglobal:epcis:xsd:1\" xmlns:sbdh=\"http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader\" schemaVersion=\"1.2\" creationDate=\"2012-03-25T17:10:16Z\">\n\t<EPCISHeader>\n\t\t<sbdh:StandardBusinessDocumentHeader>\n\t\t\t<sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>\n\t\t\t<sbdh:Sender>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:036800.111111.0</sbdh:Identifier>\n\t\t\t</sbdh:Sender>\n\t\t\t<sbdh:Receiver>\n\t\t\t\t<sbdh:Identifier Authority=\"SGLN\">urn:epc:id:sgln:0716163.01122.0</sbdh:Identifier>\n\t\t\t</sbdh:Receiver>\n\t\t\t<sbdh:DocumentIdentification>\n\t\t\t\t<sbdh:Standard>EPCglobal</sbdh:Standard>\n\t\t\t\t<sbdh:TypeVersion>1.0</sbdh:TypeVersion>\n\t\t\t\t<sbdh:InstanceIdentifier>1234567890</sbdh:InstanceIdentifier>\n\t\t\t\t<sbdh:Type>Events</sbdh:Type>\n\t\t\t\t<sbdh:CreationDateAndTime>2018-05-01T12:10:16Z</sbdh:CreationDateAndTime>\n\t\t\t</sbdh:DocumentIdentification>\n\t\t</sbdh:StandardBusinessDocumentHeader>\n\t\t<extension>\n\t\t\t<EPCISMasterData>\n\t\t\t\t<VocabularyList>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:EPCClass\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:idpat:sgtin:036800.0012345.*\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentification\">68000012345</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#additionalTradeItemIdentificationTypeCode\">FDA_NDC_11</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#regulatedProductName\">My Drug</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#manufacturerOfTradeItemPartyName\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#dosageFormType\">PILL</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#strengthDescription\">100mg</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#netContentDescription\">500</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t\t<Vocabulary type=\"urn:epcglobal:epcis:vtype:Location\">\n\t\t\t\t\t\t<VocabularyElementList>\n\t\t\t\t\t\t\t<VocabularyElement id=\"urn:epc:id:sgln:036800.111111.0\">\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#name\">My Pharma LLC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressOne\">3575 Zumstein Ave</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#streetAddressTwo\">Suite 101</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#city\">Washington</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#state\">DC</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#postalCode\">12345-6789</attribute>\n\t\t\t\t\t\t\t\t<attribute id=\"urn:epcglobal:cbv:mda#countryCode\">US</attribute>\n\t\t\t\t\t\t\t</VocabularyElement>\n\t\t\t\t\t\t</VocabularyElementList>\n\t\t\t\t\t</Vocabulary>\n\t\t\t\t</VocabularyList>\n\t\t\t</EPCISMasterData>\n\t\t</extension>\n\t</EPCISHeader>\n\t<EPCISBody>\n\t\t<EventList>\n\t\t\t<ObjectEvent>\n\t\t\t\t<eventTime>2020-11-01T10:28:08.717Z</eventTime>\n\t\t\t\t<eventTimeZoneOffset>-05:00</eventTimeZoneOffset>\n\t\t\t\t<epcList>\n\t\t\t\t\t<epc>urn:epc:id:sgln:1414141.12945.32a%2Fb</epc>\n\n\t\t\t\t</epcList>\n\t\t\t\t<action>ADD</action>\n\t\t\t\t<bizStep>urn:epcglobal:cbv:bizstep:commissioning</bizStep>\n\t\t\t\t<disposition>urn:epcglobal:cbv:disp:active</disposition>\n\t\t\t\t<readPoint>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</readPoint>\n\t\t\t\t<bizLocation>\n\t\t\t\t\t<id>urn:epc:id:sgln:036800.111111.0</id>\n\t\t\t\t</bizLocation>\n\t\t\t\t<extension>\n\t\t\t\t\t<ilmd>\n\t\t\t\t\t\t<cbvmda:lotNumber>LOT123</cbvmda:lotNumber>\n\t\t\t\t\t\t<cbvmda:itemExpirationDate>2020-12-31</cbvmda:itemExpirationDate>\n\t\t\t\t\t</ilmd>\n\t\t\t\t</extension>\n\t\t\t</ObjectEvent>\n\t\t</EventList>\n\t</EPCISBody>\n</epcis:EPCISDocument>\n","json_data": "error json"}
            mock.onGet(process.env.ORGANIZATION_SERVICE + '/organizations/').reply(200, orgResponse);
            mock.onGet(process.env.SEARCH_SERVICE + "/search/organizations/1/events").reply(200, searchResp);
            mock.onGet(process.env.EVENT_SERVICE + "/organization/1/events/da2706dd-c540-4ebb-86f3-dc5b7aaa77a2").reply(200, event1Resp);
            mock.onPost(process.env.ALERT_SERVICE + '/organization/1/alerts').reply(200, {});

            await controller.postQueryForClient(req, res);

            expect(res.send).toHaveBeenCalledTimes(1)
            expect(res.send.mock.calls.length).toBe(1);
            expect(res.send).toHaveBeenCalledWith(errorResp);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});