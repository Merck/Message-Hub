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

import { async, TestBed } from '@angular/core/testing';
import { MasterDataViewerComponent } from './master-data-viewer.component';
import { of } from 'rxjs';

describe('MasterDataViewerComponent', () => {
	let masterdataServiceMock: any;
	let translateServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]
	const successResponseData = { "id": "d3359ae8-11dd-4f3f-b06a-953831432f9d", "timestamp": "2020-09-01T05:00:52.887Z", "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f", "organization_id": 1, "source": "System 1 for Org 1", "status": "accepted", "xml_data": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<epcismd:EPCISMasterDataDocument xmlns:epcismd=\"urn:epcglobal:epcis-masterdata:xsd:1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" schemaVersion=\"1\" creationDate=\"2005-07-11T11:30:47.0Z\">\n<EPCISBody>\n  <VocabularyList>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:BusinessLocation\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epc:id:sgln:0037000.00729.0\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:slt:retail\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:latitude\" value=\"+18.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:longitude\" value=\"-70.0000\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:address\">100 Nowhere Street, FancyCity 99999</attribute>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\">\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n          <attribute id=\"urn:epcglobal:fmcg:mda:sslta:402\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n    <Vocabulary type=\"urn:epcglobal:epcis:vtype:ReadPoint\">\n      <VocabularyElementList>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.201\">\n          \n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:201\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.202\">\n          \n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:202\"/>\n        </VocabularyElement>\n        <VocabularyElement id=\"urn:epcglobal:fmcg:ssl:0037000.00729.203\">\n          \n          <attribute id=\"urn:epcglobal:fmcg:mda:sslt:203\"/>\n        </VocabularyElement>\n      </VocabularyElementList>\n    </Vocabulary>\n  </VocabularyList>\n</EPCISBody>\n</epcismd:EPCISMasterDataDocument>\n", "json_data": "{\"EPCISMasterDataDocument\":{\"schemaVersion\":\"1\",\"creationDate\":\"2005-07-11T11:30:47.0Z\",\"EPCISBody\":{\"VocabularyList\":{\"Vocabulary\":[{\"type\":\"urn:epcglobal:epcis:vtype:BusinessLocation\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epc:id:sgln:0037000.00729.0\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:slt:retail\"},{\"id\":\"urn:epcglobal:fmcg:mda:latitude\",\"value\":\"+18.0000\"},{\"id\":\"urn:epcglobal:fmcg:mda:longitude\",\"value\":\"-70.0000\"},{\"value\":\"100 Nowhere Street, FancyCity 99999\",\"id\":\"urn:epcglobal:fmcg:mda:address\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202,402\",\"attribute\":[{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslta:402\"}]}]}},{\"type\":\"urn:epcglobal:epcis:vtype:ReadPoint\",\"VocabularyElementList\":{\"VocabularyElement\":[{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.201\",\"attribute\":[{\"value\":\"\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:201\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.202\",\"attribute\":[{\"value\":\"\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:202\"}]},{\"id\":\"urn:epcglobal:fmcg:ssl:0037000.00729.203\",\"attribute\":[{\"value\":\"\",\"id\":\"urn:epcglobal:epcis:mda:site\"},{\"id\":\"urn:epcglobal:fmcg:mda:sslt:203\"}]}]}}]}}}}", "destinations": [], "value": "{ \"aa\": \"aa\" }" };
	let component: MasterDataViewerComponent;
	beforeEach(async(() => {
		masterdataServiceMock = {
			getAllMasterdata: jest.fn().mockImplementation(() => of(successResponse)),
			getData: jest.fn().mockImplementation(() => of(successResponseData)),
			getBCData: jest.fn().mockImplementation(() => of(successResponseData))
		}
		translateServiceMock = {
			currentLang: "en"
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [MasterDataViewerComponent]
		});
		JSON.parse = jest.fn().mockImplementationOnce(() => {
			successResponse
		});
		component = new MasterDataViewerComponent(masterdataServiceMock, translateServiceMock, errorHandlerMock);
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call view', () => {
		component.view('Digital Fingerprinting', 12345, 1);
		expect(component.json_data_array).not.toBe([]);
	});
	it('should call view', () => {
		component.view('Mock Adapter', 12345, 1);
		expect(component.json_data_array).not.toBe([]);
	});
	it('should call isArray', () => {
		const spy = component.isArray([]);
		expect(spy).not.toBeNull();
	});
	it('should call currentLanguage getter function', () => {
		const spy = jest.spyOn(component, 'currentLanguage', 'get');
		const currentLanguage = component.currentLanguage;
		expect(spy).toHaveBeenCalled();
	});
	it('should call prettyJSON getter function', () => {
		component._datadetails = successResponseData;
		const spy = jest.spyOn(component, 'prettyJSON', 'get');
		const currentLanguage = component.prettyJSON;
		expect(spy).toHaveBeenCalled();
	});
	it('should call buildFileTree', () => {
		const spy = component.buildFileTree({ "xxx": "yyy" }, 2);
		expect(spy).not.toBeNull();
	});
	it('should call getData', () => {
		component.getData('123');
		expect(component._datadetails).toBeDefined();
	});
});
