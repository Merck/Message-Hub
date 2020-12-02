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

import {async, TestBed} from '@angular/core/testing';

import {ToolbarUserComponent} from './toolbar-user.component';
import {of} from 'rxjs';

describe('ToolbarUserComponent', () => {
	let component: ToolbarUserComponent;
	let authServiceMock: any;
	let accountServiceMock: any;
	let routerMock: any;
	const successResponse = { "sub": "a20a8cef-b5d0-4b1c-8b63-dea45410aba9", "name": "Neeraja Manoj", "email": "neemanoj@in.ibm.com", "given_name": "Neeraja", "family_name": "Manoj", "identities": [{ "provider": "cloud_directory", "id": "da54cca7-ddc1-4826-b4ee-1416e7b80cff", "idpUserInfo": { "displayName": "Neeraja Manoj", "active": true, "mfaContext": {}, "emails": [{ "value": "neemanoj@in.ibm.com", "primary": true }], "meta": { "lastLogin": "2020-07-29T07:57:49.517Z", "created": "2020-07-17T14:50:45.965Z", "location": "/v1/7e4f16cd-a5b8-45a2-9d65-4096a488e9ee/Users/da54cca7-ddc1-4826-b4ee-1416e7b80cff", "lastModified": "2020-07-29T07:57:49.539Z", "resourceType": "User" }, "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"], "name": { "givenName": "Neeraja", "familyName": "Manoj", "formatted": "Neeraja Manoj" }, "id": "da54cca7-ddc1-4826-b4ee-1416e7b80cff", "status": "CONFIRMED", "idpType": "cloud_directory" } }] }

	beforeEach(async(() => {
		authServiceMock = {
			logout: jest.fn(),
			clearTokens: jest.fn(),
			isOrgAdmin: jest.fn()
		}
		accountServiceMock = {
			getUser: jest.fn(),
			getOrganization: jest.fn(),
			saveOrganization: jest.fn(),
			setUUID: jest.fn()
		}
		routerMock = {
			navigate: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ToolbarUserComponent]
		});
		component = new ToolbarUserComponent(authServiceMock, accountServiceMock, routerMock);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call getUser function', async () => {
		const getUserSpy = jest.spyOn(accountServiceMock, 'getUser').mockReturnValue(of(successResponse))
		const getOrgSpy = jest.spyOn(accountServiceMock, 'getOrganization').mockReturnValue(of(successResponse))
		component.ngOnInit();
		expect(getUserSpy).toBeDefined();
		expect(getOrgSpy).toBeDefined();
	});
	it('should call logout function', async () => {
		const logoutSpy = jest.spyOn(authServiceMock, 'logout').mockReturnValue(of(successResponse))
		const spyclearTokens = jest.spyOn(authServiceMock, 'clearTokens');
		component.logout();
		expect(logoutSpy).toBeDefined();
		expect(spyclearTokens).toHaveBeenCalled();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call profileInfo function', async () => {
		component.profileInfo();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call orgDetails function', async () => {
		component.orgDetails();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call changePassword function', async () => {
		component.changePassword();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call userFullName getter function', () => {
		const spy = jest.spyOn(component, 'userFullName', 'get');
		const password = component.userFullName;
		expect(spy).toHaveBeenCalled();
	});
	it('should call organizationName getter function', () => {
		const spy = jest.spyOn(component, 'organizationName', 'get');
		const password = component.organizationName;
		expect(spy).toHaveBeenCalled();
	});
	it('should call isOrgAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isOrgAdmin', 'get');
		const password = component.isOrgAdmin;
		expect(spy).toHaveBeenCalled();
	});
});
