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

import {AccountService} from './account-service.service';
import {FormBuilder} from '@angular/forms';

describe('AccountServiceService', () => {
	let service: AccountService;
	const http = jest.fn();
	const formBuilder: FormBuilder = new FormBuilder();
	beforeEach(() => {
		service = new AccountService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should get user details', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		serviceMock.getUser();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get organization details', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		serviceMock.getOrganization();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get users', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		serviceMock.getUsers();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should edit user', done => {
		const httpMock = {
			patch: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		let form = formBuilder.group({
			'email': [''],
			'firstName': [''],
			'lastName': ['']
		});
		form.controls['email'].markAsTouched();
		form.controls['firstName'].markAsTouched();
		form.controls['lastName'].markAsTouched();
		serviceMock.editUser(form);
		expect(httpMock.patch).toBeDefined();
		expect(httpMock.patch).toHaveBeenCalled();
		done();
	});
	it('should get organization user', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		serviceMock.getOrganizationUser('xxx');
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should edit organization', done => {
		const httpMock = {
			patch: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		let form = formBuilder.group({
			'org': ['']
		});
		form.controls['org'].markAsTouched();
		serviceMock.editOrganization(form);
		expect(httpMock.patch).toBeDefined();
		expect(httpMock.patch).toHaveBeenCalled();
		done();
	});
	it('should save Username details', () => {
		service.saveUsername("username")
		expect(window.sessionStorage.getItem("USERNAME")).toBe("username");
	});
	it('should save org details', () => {
		service.saveOrganization("123", "org")
		expect(window.sessionStorage.getItem("ORGID")).toBe("123");
		expect(window.sessionStorage.getItem("ORGNAME")).toBe("org");
	});
	it('should edit user in org', done => {
		const httpMock = {
			patch: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		let form = formBuilder.group({
			'user': [''],
			'firstname': [''],
			'lastname': [''],
			'role': [false],
		});
		form.controls['user'].markAsTouched();
		form.controls['firstname'].markAsTouched();
		form.controls['lastname'].markAsTouched();
		form.controls['role'].markAsTouched();
		serviceMock.editUserOrg(form, 1);
		expect(httpMock.patch).toBeDefined();
		expect(httpMock.patch).toHaveBeenCalled();
		done();
	});
	it('should save user to org', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		let form = formBuilder.group({
			'user': [''],
			'password': [''],
			'firstname': [''],
			'lastname': [''],
			'role': [''],
		});
		serviceMock.addUserOrg(form);
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should delete organization user', done => {
		const httpMock = {
			delete: jest.fn()
		}
		const serviceMock = new AccountService(httpMock as any);
		serviceMock.deleteUserOrg(1);
		expect(httpMock.delete).toBeDefined();
		expect(httpMock.delete).toHaveBeenCalled();
		done();
	});
	it('should get username', () => {
		service.getUsername()
		expect(service.getUsername()).not.toBeNull();
	});
	it('should get user fullname', () => {
		service.getUserFullName()
		expect(service.getUsername()).not.toBeNull();
	});
	it('should get org id', () => {
		service.getOrgId()
		expect(service.getOrgId()).not.toBeNull();
	});
	it('should get org name', () => {
		service.getOrgName()
		expect(service.getOrgName()).not.toBeNull();
	});
	it('should set UUID', () => {
		service.setUUID('xxx')
		expect(service.getOrgName()).not.toBeNull();
	});
	it('should get UUID', () => {
		service.getUUID()
		expect(service.getOrgName()).not.toBeNull();
	});
});
