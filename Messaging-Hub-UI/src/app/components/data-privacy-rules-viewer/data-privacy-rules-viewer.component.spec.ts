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
import { DataPrivacyRulesViewerComponent } from './data-privacy-rules-viewer.component';
import { of } from 'rxjs';

describe('DataPrivacyRulesViewerComponent', () => {
	let component: DataPrivacyRulesViewerComponent;
	let authServiceMock: any;
	let privacyServiceMock: any;
	let accountServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }];
	const successResponse1 = [{ "id": 1, "path": "$.epcisbody.eventlist.objectevent.bizstep", "display_name": "Business Step", "data_type": "object" }, { "id": 2, "path": "$somepath.someelement", "display_name": "Element", "data_type": "aggregation" }, { "id": 3, "path": "$somepath.someelement", "display_name": "Element", "data_type": "transformation" }, { "id": 4, "path": "$somepath.someelement", "display_name": "Element", "data_type": "transaction" }, { "id": 5, "path": "$somepath.someelement", "display_name": "Element", "data_type": "masterdata" }, { "id": 6, "path": "urn:epcglobal:epcis:vtype:BusinessLocation", "display_name": "Business Location", "data_type": "masterdata" }, { "id": 7, "path": "urn:epcglobal:epcis:vtype:ReadPoint", "display_name": "Read Point", "data_type": "masterdata" }, { "id": 8, "path": "$.epcisbody.eventlist.objectevent.epclist", "display_name": "EPC List", "data_type": "object" }, { "id": 9, "path": "$.epcisbody.eventlist.objectevent.readpoint", "display_name": "Read Point", "data_type": "object" }]
	const successResponse2 = { "id": 131, "organization_id": 1, "data_field": 6, "can_store": true, "datafield_type": "masterdata", "datafield_display": "Business Location Address", "datafield_path": "$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value", "order": -1 }
	beforeEach(async(() => {
		authServiceMock = {
			isOrgAdmin: jest.fn()
		}
		privacyServiceMock = {
			getDataElement: jest.fn().mockImplementation(() => of(successResponse1)),
			getAllPrivacyRules: jest.fn().mockImplementation(() => of(successResponse)),
			addPrivacyRule: jest.fn().mockImplementation(() => of(successResponse)),
			editPrivacyRule: jest.fn().mockImplementation(() => of(successResponse)),
			deletePrivacyRule: jest.fn().mockImplementation(() => of(successResponse)),
			reorderPrivacyRule: jest.fn().mockImplementation(() => of(successResponse)),
			getPrivacyRule: jest.fn().mockImplementation(() => of(successResponse2))
		}
		accountServiceMock = {
			getUsername: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [DataPrivacyRulesViewerComponent]
		});
		component = new DataPrivacyRulesViewerComponent(authServiceMock, privacyServiceMock, accountServiceMock, errorHandlerMock);
		component.closebutton1 = {
			nativeElement: {
				click() { }
			}
		}
		component.closebutton2 = {
			nativeElement: {
				click() { }
			}
		}
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call addRR', () => {
		component.addRR();
		expect(component.results.length).not.toBe(0);
	});
	it('should call editRR', () => {
		component.editRR();
		expect(component.results.length).not.toBe(0);
	});
	it('should call deleteRR', () => {
		component.deleteRR();
		expect(component.results.length).not.toBe(0);
	});
	it('should call reorderRR', () => {
		component.reorderRR();
		expect(component.results.length).not.toBe(0);
	});
	it('should call selected', () => {
		component.edit = true;
		component.selected(1);
		expect(component.editID).toEqual(1);
	});
	it('should call selected', () => {
		component.delete = true;
		component.selected(1);
		expect(component.deleteID).toEqual(1);
	});
	it('should call cancel', () => {
		component.cancel();
		expect(component.rulesForm.controls['dataElement'].value).toBeNull();
	});
	it('should call cancelReorder', () => {
		component.cancelReorder();
		expect(component.results.length).not.toBe(0);
	});
	it('should call onEventTypeChange', () => {
		component.onEventTypeChange({ "target": { "value": "object" } });
		expect(component.dataElements.length).not.toBe(0);
	});
	it('should call resetData', () => {
		component.resetData();
		expect(component.dataElements.length).toBe(0);
	});
	it('should call privacySetting', () => {
		const spy = component.privacySetting(true);
		expect(spy).not.toBeNull();
	});
	it('should call privacySetting', () => {
		const spy = component.privacySetting(false);
		expect(spy).not.toBeNull();
	});
	it('should call isOrgAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isOrgAdmin', 'get');
		const isOrgAdmin = component.isOrgAdmin;
		expect(spy).toHaveBeenCalled();
	});
});
