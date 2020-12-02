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

import { OrgInfoComponent } from './org-info.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

describe('OrgInfoComponent', () => {
	let component: OrgInfoComponent;
	let accountServiceMock: any;
	let routerMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponseData = [{ "username": "username", "givenName": "xxx", "familyName": "yyy", "roles": [{ "name": "organization_admin" }] }]

	beforeEach(async(() => {
		accountServiceMock = {
			getOrgName: jest.fn(),
			getOrganization: jest.fn().mockImplementation(() => of(successResponse)),
			getUsers: jest.fn().mockImplementation(() => of(successResponse)),
			editOrganization: jest.fn().mockImplementation(() => of(successResponse)),
			saveOrganization: jest.fn(),
			getUsername: jest.fn(),
			getOrganizationUser: jest.fn().mockImplementation(() => of(successResponseData)),
			addUserOrg: jest.fn().mockImplementation(() => of(successResponse)),
			editUserOrg: jest.fn().mockImplementation(() => of(successResponse)),
			deleteUserOrg: jest.fn().mockImplementation(() => of(successResponse))
		}
		routerMock = {
			navigate: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		authServiceMock = {
			clearTokens: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [OrgInfoComponent]
		});
		component = new OrgInfoComponent(accountServiceMock, routerMock, authServiceMock, errorHandlerMock);
		component.orgForm = formBuilder.group({
			'org': ['']
		});
		component.userAddForm = formBuilder.group({
			'user': [''],
			'password': [''],
			'firstname': [''],
			'lastname': [''],
			'role': [false]
		});
		component.userEditForm = formBuilder.group({
			'user': [''],
			'firstname': [''],
			'lastname': [''],
			'role': [false]
		});
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
		component.closebutton3 = {
			nativeElement: {
				click() { }
			}
		}
		component.closebutton4 = {
			nativeElement: {
				click() { }
			}
		}
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call onOrgEdit', () => {
		component.isEditOrgEnable = false;
		component.onOrgEdit()
		expect(component.isEditOrgEnable).toBeTruthy();
	});
	it('should call onOrgSave', () => {
		component.isEditOrgEnable = true;
		component.onOrgSave()
		expect(component.isEditOrgEnable).toBeFalsy();
	});
	it('should call cancel function', () => {
		component.onCancel();
		expect(component.error).toBe("");
	});
	it('should call home function', () => {
		component.home();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call selected function', () => {
		component.edit = true;
		component.selected({ "username": "xxx", "role": "yyy" });
		expect(component.userEditForm.controls['user'].value).not.toBeNull();
	});
	it('should call selected function', () => {
		component.delete = true;
		component.selected({ "username": "xxx", "role": "yyy" });
		expect(component.deleteID).not.toBeNull();
	});
	it('should call validateForm function', () => {
		component.orgForm.controls['org'].setValue(null)
		component.validateForm();
		expect(component.orgForm.get('org').touched).toBe(true)
	});
	it('should call validateAddEdit function', () => {
		component.add = true;
		component.userAddForm.controls['user'].setValue(null)
		component.validateAddEdit();
		expect(component.userAddForm.get('user').touched).toBe(true)
	});
	it('should call onAdd function', () => {
		component.onAdd();
		expect(component.results.length).not.toBe(0)
	});
	it('should call onEdit function', () => {
		component.onEdit();
		expect(component.results.length).not.toBe(0)
	});
	it('should call onEdit function self change', () => {
		component.selfChange = true;
		component.onEdit();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call onDelete function', () => {
		component.onDelete();
		expect(component.results.length).not.toBe(0)
	});
	it('should call onDelete function self change', () => {
		component.selfChange = true;
		component.onDelete();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call org getter function', () => {
		const spy = jest.spyOn(component, 'org', 'get');
		const org = component.org;
		expect(spy).toHaveBeenCalled();
	});
	it('should call user getter function', () => {
		const spy = jest.spyOn(component, 'user', 'get');
		const org = component.user;
		expect(spy).toHaveBeenCalled();
	});
	it('should call password getter function', () => {
		const spy = jest.spyOn(component, 'password', 'get');
		const org = component.password;
		expect(spy).toHaveBeenCalled();
	});
	it('should call firstname getter function', () => {
		const spy = jest.spyOn(component, 'firstname', 'get');
		const org = component.firstname;
		expect(spy).toHaveBeenCalled();
	});
	it('should call lastname getter function', () => {
		const spy = jest.spyOn(component, 'lastname', 'get');
		const org = component.lastname;
		expect(spy).toHaveBeenCalled();
	});
	it('should call role getter function', () => {
		const spy = jest.spyOn(component, 'role', 'get');
		const org = component.role;
		expect(spy).toHaveBeenCalled();
	});
	it('should call userEdit getter function', () => {
		const spy = jest.spyOn(component, 'userEdit', 'get');
		const org = component.userEdit;
		expect(spy).toHaveBeenCalled();
	});
	it('should call firstnameEdit getter function', () => {
		const spy = jest.spyOn(component, 'firstnameEdit', 'get');
		const org = component.firstnameEdit;
		expect(spy).toHaveBeenCalled();
	});
	it('should call lastnameEdit getter function', () => {
		const spy = jest.spyOn(component, 'lastnameEdit', 'get');
		const org = component.lastnameEdit;
		expect(spy).toHaveBeenCalled();
	});
	it('should call roleEdit getter function', () => {
		const spy = jest.spyOn(component, 'roleEdit', 'get');
		const org = component.roleEdit;
		expect(spy).toHaveBeenCalled();
	});
});
