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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

@Injectable({
	providedIn: 'root'
})
export class PrivacyService {

	constructor(private _httpClient: HttpClient) { }

	getAllPrivacyRules() {
		return this._httpClient.get('/admin/dataprivacyrules');
	}
	addPrivacyRule(privacyForm: FormGroup, order, editor) {
		const params = {
			data_field: privacyForm.get('dataElement').value,
			can_store: privacyForm.get('privacySettings').value ? true : false,
			order: order,
			editor: editor
		};
		return this._httpClient.post('/admin/dataprivacyrules', params);
	}
	editPrivacyRule(privacyForm: FormGroup, order, editor, id) {
		const params = {
			data_field: privacyForm.get('dataElement').value,
			can_store: privacyForm.get('privacySettings').value,
			editor: editor
		};
		return this._httpClient.patch(`/admin/dataprivacyrules/${id}`, params);
	}
	deletePrivacyRule(id, editor) {
		const params = {
			editor: editor
		};
		const httpOptions = {
			headers: new HttpHeaders(),
			body: params
		};
		return this._httpClient.delete(`/admin/dataprivacyrules/${id}`, httpOptions);
	}
	reorderPrivacyRule(idArray, editor) {
		const params = {
			rulesordered: idArray,
			editor: editor
		};
		return this._httpClient.patch('/admin/dataprivacyrules', params);
	}
	getPrivacyRule(id) {
		return this._httpClient.get(`/admin/dataprivacyrules/${id}`);
	}
	getDataElement() {
		return this._httpClient.get('/admin/dataprivacyrules/config/datafields');
	}
	getPrivacyRulesHistory() {
		return this._httpClient.get('/admin/dataprivacyrules/history');
	}
}
