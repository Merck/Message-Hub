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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormGroup} from '@angular/forms';
import {tap} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class AccountService {
	private readonly USERNAME = 'USERNAME';
	private readonly USERFULLNAME = 'USERFULLNAME';
	private readonly ORGID = 'ORGID';
	private readonly ORGNAME = 'ORGNAME';
	private readonly UUID = 'UUID';

	constructor(private _httpClient: HttpClient) { }

	getUser() {
		try {
			return this._httpClient.get('/admin/user').pipe(
				tap(
					(data: any) => {
						sessionStorage.setItem(this.USERFULLNAME, data.displayName);
					}
				)
			);
		} catch (e) {
			console.log(e);
		}
	}

	getOrganization() {
		try {
			return this._httpClient.get('/admin/organization');
		} catch (e) {
			console.log(e);
		}
	}

	getUsers() {
		try {
			return this._httpClient.get('/admin/organization/users');
		} catch (e) {
			console.log(e);
		}
	}

	editUser(profileForm: FormGroup) {
		var params = {}
		if (profileForm.get('lastName').touched) {
			Object.assign(params, { newlastname: profileForm.get('lastName').value });
		}
		if (profileForm.get('firstName').touched) {
			Object.assign(params, { newfirstname: profileForm.get('firstName').value });
		}
		if (profileForm.get('email').touched) {
			Object.assign(params, { newusername: profileForm.get('email').value });
		}
		return this._httpClient.patch('/admin/user', params);
	}

	getOrganizationUser(subjectId: string) {
		try {
			return this._httpClient.get('/admin/organization/users/' + subjectId);
		} catch (e) {
			console.log(e);
		}
	}

	editOrganization(orgForm: FormGroup) {
		const params = {
			name: orgForm.get('org').value
		};
		return this._httpClient.patch('/admin/organization', params);
	}

	saveUsername(username: string) {
		sessionStorage.setItem(this.USERNAME, username);
	}

	saveOrganization(orgId: string, orgName: string) {
		sessionStorage.setItem(this.ORGID, orgId);
		sessionStorage.setItem(this.ORGNAME, orgName);
	}
	addUserOrg(userAddOrg: FormGroup) {
		const params = {
			username: userAddOrg.get('user').value,
			password: userAddOrg.get('password').value,
			firstname: userAddOrg.get('firstname').value,
			lastname: userAddOrg.get('lastname').value,
			isadmin: userAddOrg.get('role').value ? true : false,
		};
		return this._httpClient.post('/admin/organization/users', params);
	}
	editUserOrg(userEditForm: FormGroup, id) {
		var params = {}
		if (userEditForm.get('user').touched) {
			Object.assign(params, { newusername: userEditForm.get('user').value });
		}
		if (userEditForm.get('firstname').touched) {
			Object.assign(params, { newfirstname: userEditForm.get('firstname').value });
		}
		if (userEditForm.get('lastname').touched) {
			Object.assign(params, { newlastname: userEditForm.get('lastname').value });
		}
		if (userEditForm.get('role').touched) {
			Object.assign(params, { isadmin: userEditForm.get('role').value });
		}
		return this._httpClient.patch('/admin/organization/users/' + id, params);
	}
	deleteUserOrg(id) {
		return this._httpClient.delete('/admin/organization/users/' + id);
	}

	getUsername() {
		return sessionStorage.getItem(this.USERNAME);
	}
	getUserFullName() {
		return sessionStorage.getItem(this.USERFULLNAME);
	}

	getOrgId() {
		return sessionStorage.getItem(this.ORGID);
	}

	getOrgName() {
		return sessionStorage.getItem(this.ORGNAME);
	}
	setUUID(id: any) {
		sessionStorage.setItem(this.UUID, id);
	}
	getUUID() {
		return sessionStorage.getItem(this.UUID)
	}
}
