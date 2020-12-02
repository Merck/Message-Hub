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

import { ProfileInfoComponent } from './profile-info.component';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

describe('ProfileInfoComponent', () => {
	let routerMock: any;
	let accountServiceMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]
	const formBuilder: FormBuilder = new FormBuilder();

	let component: ProfileInfoComponent;
	beforeEach(async(() => {
		routerMock = {
			navigate: jest.fn()
		}
		accountServiceMock = {
			getUser: jest.fn().mockImplementation(() => of(successResponse)),
			editUser: jest.fn().mockImplementation(() => of(successResponse))
		}
		authServiceMock = {
			isOrgAdmin: jest.fn(),
			clearTokens: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ProfileInfoComponent]
		});
		component = new ProfileInfoComponent(authServiceMock, accountServiceMock, routerMock, errorHandlerMock);
		component.profileForm = formBuilder.group({
			'firstName': [''],
			'lastName': [''],
			'email': ['']
		});
		component.closebutton = {
			nativeElement: {
				click() { }
			}
		}
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call onFirstNameEdit', () => {
		component.isEditFirstNameEnable = false;
		component.onFirstNameEdit()
		expect(component.isEditFirstNameEnable).toBeTruthy();
	});
	it('should call onLastNameEdit', () => {
		component.isEditLastNameEnable = false;
		component.onLastNameEdit()
		expect(component.isEditLastNameEnable).toBeTruthy();
	});
	it('should call onEmailEdit', () => {
		component.isEditEmailEnable = false;
		component.onEmailEdit()
		expect(component.isEditEmailEnable).toBeTruthy();
	});
	it('should call onSave function', () => {
		component.onSave();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call cancel function', () => {
		component.onCancel();
		expect(component.error).toBe("");
	});
	it('should call home function', () => {
		component.home();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call validateForm function', () => {
		component.profileForm.controls['firstName'].setValue(null)
		component.validateForm();
		expect(component.profileForm.get('firstName').touched).toBe(true)
	});
	it('should call email getter function', () => {
		const spy = jest.spyOn(component, 'email', 'get');
		const org = component.email;
		expect(spy).toHaveBeenCalled();
	});
	it('should call firstname getter function', () => {
		const spy = jest.spyOn(component, 'firstName', 'get');
		const org = component.firstName;
		expect(spy).toHaveBeenCalled();
	});
	it('should call lastname getter function', () => {
		const spy = jest.spyOn(component, 'lastName', 'get');
		const org = component.lastName;
		expect(spy).toHaveBeenCalled();
	});
	it('should call roles getter function', () => {
		const spy = jest.spyOn(component, 'roles', 'get');
		const org = component.roles;
		expect(spy).toHaveBeenCalled();
	});
});
