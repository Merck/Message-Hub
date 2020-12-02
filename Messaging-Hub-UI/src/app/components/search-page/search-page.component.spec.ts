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

import { SearchPageComponent } from './search-page.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

describe('SearchPageComponent', () => {
	let component: SearchPageComponent;
	let searchServiceMock: any;
	let eventServiceMock: any;
	let translateServiceMock: any;
	let dateAdapterMock: any;
	let routeMock: any;
	let errorHandlerMock: any;
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponse = { "totalResults": 16, "value": "{ \"aa\": \"aa\" }", "totalPages": 1, "currentPage": 1, "resultsPerPage": 25, "results": [{ "organization": "1", "id": "424a237c-9238-4975-8981-8ee052b0bc3f", "textids": ["urn:epc:id:sgtin:036800.0012345.10000000001", "urn:epc:id:sgtin:036800.0012345.10000000002", "urn:epc:id:sgtin:036800.0012345.10000000003", "urn:epc:id:sgtin:036800.1012345.22222222222"], "timestamp": "2012-03-25T10:10:16Z", "type": "object", "action": "add", "source": "System 1 for Org 1", "status": "on_ledger", "destination": "Mock Adapter" }] }
	const response = { value: 'aaa' };
	const eventSucessResponse = { "id": "2ca4b0fe-3734-4217-af0d-c4f9550059d6", "timestamp": "2020-12-31T07:14:15.000Z", "client_id": "6c17d9ce-a7f2-4422-8205-023e2d76ee7f", "organization_id": 1, "type": "object", "action": "add", "source": "System 1 for Org 1", "status": "on_ledger", "xml_data": "REDACTED", "json_data": "{\"EPCISDocument\":{\"EPCISBody\":{\"EventList\":{\"ObjectEvent\":{\"eventTime\":\"2020-12-31T07:14:15Z\",\"eventTimeZoneOffset\":\"+08:00\",\"epcList\":{\"epc\":[\"urn:epc:id:sgtin:9999555.600301.100000043583\",\"urn:epc:id:sgtin:9999555.600301.100000043771\",\"urn:epc:id:sgtin:9999555.600301.100000043207\",\"urn:epc:id:sgtin:9999555.600301.100000043254\",\"urn:epc:id:sgtin:9999555.600301.100000043301\",\"urn:epc:id:sgtin:9999555.600301.100000043630\",\"urn:epc:id:sgtin:9999555.600301.100000043677\"]},\"action\":\"ADD\",\"bizStep\":\"sap:att:activity:18\",\"disposition\":\"urn:epcglobal:cbv:disp:in_transit\",\"readPoint\":{\"id\":\"(414)0300060000041(254)0\"},\"bizTransactionList\":{\"bizTransaction\":\"urn:epcglobal:cbv:bt:0300060000041:8216327422020\"},\"extension\":{\"sourceList\":{\"source\":[\"(414)0300060000041(254)0\",\"(414)0300060000041(254)0\"]},\"destinationList\":{\"destination\":[\"(414)0300060000171(254)0\",\"(414)0300060000171(254)0\"]}}}}}}}", "destinations": [{ "destination_name": "Mock Adapter 2", "status": "on_ledger", "timestamp": "2020-08-26T18:25:43.836Z", "blockchain_response": "Got it thanks", }] }
	beforeEach(async(() => {
		dateAdapterMock = {
			setLocale: jest.fn()
		}
		searchServiceMock = {
			search: jest.fn().mockImplementation(() => of(successResponse)),
			getEventTypes: jest.fn(),
			getEventActions: jest.fn(),
			getEventSources: jest.fn().mockImplementation(() => of(successResponse)),
			getEventDestinations: jest.fn().mockImplementation(() => of(successResponse)),
			getEventStatuses: jest.fn()
		}
		eventServiceMock = {
			getEvent: jest.fn().mockImplementation(() => of(eventSucessResponse)),
			getBCData: jest.fn().mockImplementation(() => of(successResponse))
		}
		translateServiceMock = {
			currentLang: 'en'
		}
		routeMock = {
			params: of((response))
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [SearchPageComponent]
		});
		component = new SearchPageComponent(searchServiceMock, eventServiceMock, translateServiceMock, dateAdapterMock, routeMock, errorHandlerMock);
		component.searchForm = formBuilder.group({
			querytext: [''],
			startdate: [''],
			enddate: [''],
			type: [''],
			source: [''],
			destination: [''],
			status: ['']
		});
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call ngOnInit', () => {
		component.ngOnInit();
		expect(routeMock.params).toBeTruthy();
	});
	it('should call search function', () => {
		const spylogin = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.search();
		expect(searchServiceMock.search('a', 1, 20, [])).toBeDefined();
	});
	it('should call changePage function', () => {
		const spylogin = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.changePage(2);
		expect(searchServiceMock.search('a', 1, 20, [])).toBeDefined();
	});
	it('should call changePageSize function', () => {
		const spylogin = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.changePageSize(25);
		expect(searchServiceMock.search('a', 1, 20, [])).toBeDefined();
	});
	it('should call getEvent function', () => {
		component.getEvent('24');
		expect(eventServiceMock.getEvent('24')).toBeDefined();
	});
	it('should call results getter function', () => {
		const spy = jest.spyOn(component, 'results', 'get');
		const password = component.results;
		expect(spy).toHaveBeenCalled();
	});
	it('should call types getter function', () => {
		const spy = jest.spyOn(component, 'types', 'get');
		const password = component.types;
		expect(spy).toHaveBeenCalled();
	});
	it('should call actions getter function', () => {
		const spy = jest.spyOn(component, 'actions', 'get');
		const actions = component.actions;
		expect(spy).toHaveBeenCalled();
	});
	it('should call sources getter function', () => {
		const spy = jest.spyOn(component, 'sources', 'get');
		const password = component.sources;
		expect(spy).toHaveBeenCalled();
	});
	it('should call destinations getter function', () => {
		const spy = jest.spyOn(component, 'destinations', 'get');
		const password = component.destinations;
		expect(spy).toHaveBeenCalled();
	});
	it('should call statuses getter function', () => {
		const spy = jest.spyOn(component, 'statuses', 'get');
		const password = component.statuses;
		expect(spy).toHaveBeenCalled();
	});
	it('should call currentLanguage getter function', () => {
		const spy = jest.spyOn(component, 'currentLanguage', 'get');
		const password = component.currentLanguage;
		expect(spy).toHaveBeenCalled();
	});
	it('should call event getter function', () => {
		const spy = jest.spyOn(component, 'event', 'get');
		const password = component.event;
		expect(spy).toHaveBeenCalled();
	});
	it('should call prettyJSON getter function', () => {
		component._event = eventSucessResponse;
		const spy = jest.spyOn(component, 'prettyJSON', 'get');
		const pretty = component.prettyJSON;
		expect(spy).toHaveBeenCalled();
	});
	it('should call view', () => {
		component.view('Digital Fingerprinting', 12345, 1);
		expect(component.json_data_array).not.toBe([]);
	});
	it('should call view', () => {
		component.view('Mock Adapter', 12345, 1);
		expect(component.json_data_array).not.toBe([]);
	});
	it('should call isArray function', () => {
		const spy = component.isArray(["abc"])
		expect(spy).toBeTruthy();
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('eventTime', 'asc');
		expect(component.eventTimeSort).toBe('asc')
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('eventType', 'asc');
		expect(component.eventTypeSort).toBe('asc')
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('eventAction', 'asc');
		expect(component.eventActionSort).toBe('asc')
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('source', 'asc');
		expect(component.sourceSort).toBe('asc')
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('destination', 'asc');
		expect(component.destinationSort).toBe('asc')
	});
	it('should set the sort details', () => {
		const spy = jest.spyOn(searchServiceMock, 'search').mockReturnValue(of(successResponse));
		component.setSortDetails('status', 'asc');
		expect(component.statusSort).toBe('asc')
	});
});
