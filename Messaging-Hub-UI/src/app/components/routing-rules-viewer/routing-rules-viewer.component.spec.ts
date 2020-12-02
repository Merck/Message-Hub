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

import { RoutingRulesViewerComponent } from './routing-rules-viewer.component';
import { of } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { MustContain } from '../../shared/validators/must-contain.validator';

describe('RoutingRulesViewerComponent', () => {
	let component: RoutingRulesViewerComponent;
	let authServiceMock: any;
	let routingServiceMock: any;
	let accountServiceMock: any;
	let errorHandlerMock: any;
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]
	const successResponse1 = [{ "id": 1, "path": "$.epcisbody.eventlist.objectevent.bizstep", "display_name": "Business Step", "data_type": "object" }, { "id": 2, "path": "$somepath.someelement", "display_name": "Element", "data_type": "aggregation" }, { "id": 3, "path": "$somepath.someelement", "display_name": "Element", "data_type": "transformation" }, { "id": 4, "path": "$somepath.someelement", "display_name": "Element", "data_type": "transaction" }, { "id": 5, "path": "$somepath.someelement", "display_name": "Element", "data_type": "masterdata" }, { "id": 6, "path": "urn:epcglobal:epcis:vtype:BusinessLocation", "display_name": "Business Location", "data_type": "masterdata" }, { "id": 7, "path": "urn:epcglobal:epcis:vtype:ReadPoint", "display_name": "Read Point", "data_type": "masterdata" }, { "id": 8, "path": "$.epcisbody.eventlist.objectevent.epclist", "display_name": "EPC List", "data_type": "object" }, { "id": 9, "path": "$.epcisbody.eventlist.objectevent.readpoint", "display_name": "Read Point", "data_type": "object" }]
	const successResponse2 = { "id": 215, "organization_id": 1, "data_field": 9, "datafield_type": "masterdata", "datafield_display": "Business Location Address", "datafield_path": "$..Vocabulary[?(@.type=='urn:epcglobal:epcis:vtype:BusinessLocation')]..attribute[?(@.id==='urn:epcglobal:fmcg:mda:address')].value", "datafield_prefix": null, "comparator": 2, "comparator_operation": "abc", "comparator_display": "abc", "value": "*Nowhere12", "destinations": ["mock-adapter"], "order": -1 }
	const successResponse3 = [{ "id": 1, "operation": "equal", "display_name": "Is equal to" }, { "id": 7, "operation": "lessThanInclusive", "display_name": "Is less than or equal to" }, { "id": 3, "operation": "isLike", "display_name": "is like (wildcard *)" }, { "id": 4, "operation": "greaterThan", "display_name": "Is greater than" }, { "id": 5, "operation": "greaterThanInclusive", "display_name": "Is greater than or equal to" }, { "id": 6, "operation": "lessThan", "display_name": "Is less than" }, { "id": 10, "operation": "contains", "display_name": "Contains value" }, { "id": 11, "operation": "doesNotContain", "display_name": "Does not contain" }, { "id": 2, "operation": "notEqual", "display_name": "Is not equal to" }]
	beforeEach(async(() => {
		authServiceMock = {
			isOrgAdmin: jest.fn()
		}
		routingServiceMock = {
			getDataElement: jest.fn().mockImplementation(() => of(successResponse1)),
			getComparator: jest.fn().mockImplementation(() => of(successResponse3)),
			getDestination: jest.fn().mockImplementation(() => of(successResponse)),
			getAllRoutingRules: jest.fn().mockImplementation(() => of(successResponse)),
			addRoutingRule: jest.fn().mockImplementation(() => of(successResponse)),
			editRoutingRule: jest.fn().mockImplementation(() => of(successResponse)),
			deleteRoutingRule: jest.fn().mockImplementation(() => of(successResponse)),
			reorderRoutingRule: jest.fn().mockImplementation(() => of(successResponse)),
			getRoutingRule: jest.fn().mockImplementation(() => of(successResponse2))
		}
		accountServiceMock = {
			getUsername: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [RoutingRulesViewerComponent]
		});
		component = new RoutingRulesViewerComponent(authServiceMock, routingServiceMock, accountServiceMock, errorHandlerMock);
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
		component.rulesForm.controls['value'].setValue("aa*")
		component.selected(1);
		expect(component.editID).toEqual(1);
	});
	it('should call selected', () => {
		component.delete = true;
		component.selected(1);
		expect(component.deleteID).toEqual(1);
	});
	it('should call validateForm function', () => {
		component.rulesForm.controls['comparator'].setValue(null)
		component.validateForm();
		expect(component.rulesForm.get('comparator').touched).toBe(true)
	});
	it('should call cancel', () => {
		component.cancel();
		expect(component.rulesForm.controls['dataElement'].value).toBeNull();
	});
	it('should call cancelReorder', () => {
		component.cancelReorder();
		expect(component.results.length).not.toBe(0);
	});
	it('should call mapdest', () => {
		const spy = component.mapdest("abc");
		expect(spy).toBeDefined();
	});
	it('should call onEventTypeChange', () => {
		component.onEventTypeChange({ target: { value: "aaa" } });
		expect(component.rulesForm.controls['dataElement'].value).toBeNull();
	});
	it('should call resetData', () => {
		component.resetData();
		expect(component.dataElements).toEqual([]);
	});
	it('should call isOrgAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isOrgAdmin', 'get');
		const isOrgAdmin = component.isOrgAdmin;
		expect(spy).toHaveBeenCalled();
	});
});
