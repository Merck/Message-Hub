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
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormGroup} from '@angular/forms';

@Injectable({
	providedIn: 'root'
})
export class RoutingService {

	constructor(private _httpClient: HttpClient) { }

	getAllRoutingRules() {
		return this._httpClient.get('/admin/routingrules');
	}
	addRoutingRule(rulesForm: FormGroup, order, editor) {
		let dest = [];
		rulesForm.get('destination').value.forEach(element => {
			dest.push(element.service_name)
		});
		const params = {
			data_field: rulesForm.get('dataElement').value,
			comparator: rulesForm.get('comparator').value,
			value: rulesForm.get('value').value,
			destinations: dest,
			order: order,
			editor: editor
		};
		return this._httpClient.post('/admin/routingrules', params);
	}
	editRoutingRule(rulesForm: FormGroup, order, editor, id) {
		let dest = [];
		rulesForm.get('destination').value.forEach(element => {
			dest.push(element.service_name)
		});
		const params = {
			data_field: rulesForm.get('dataElement').value,
			comparator: rulesForm.get('comparator').value,
			value: rulesForm.get('value').value,
			destinations: dest,
			order: order,
			editor: editor
		};
		return this._httpClient.patch(`/admin/routingrules/${id}`, params);
	}
	deleteRoutingRule(id, editor) {
		const params = {
			editor: editor
		};
		const httpOptions = {
			headers: new HttpHeaders(),
			body: params
		};
		return this._httpClient.delete(`/admin/routingrules/${id}`, httpOptions);
	}
	reorderRoutingRule(idArray, editor) {
		const params = {
			rulesordered: idArray,
			editor: editor
		};
		return this._httpClient.patch('/admin/routingrules', params);
	}
	getRoutingRule(id) {
		return this._httpClient.get(`/admin/routingrules/${id}`);
	}
	getDataElement() {
		return this._httpClient.get('/admin/routingrules/config/datafields');
	}
	getComparator() {
		return this._httpClient.get('/admin/routingrules/config/comparators');
	}
	getDestination() {
		return this._httpClient.get('/admin/routingrules/config/destinations');
	}
	getRoutingRulesHistory() {
		return this._httpClient.get('/admin/routingrules/history');
	}

}
