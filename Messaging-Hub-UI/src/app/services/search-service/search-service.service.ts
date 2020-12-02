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
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

@Injectable({
	providedIn: 'root'
})
export class SearchService {


	constructor(private _httpClient: HttpClient) {
	}


	getEventTypes() {
		return ["object", "transaction", "transformation"];
	}

	getEventActions() {
		return ["add", "observe", "delete"];
	}

	getEventSources() {
		return this._httpClient.get('/admin/eventsources');
	}

	getEventDestinations() {
		return this._httpClient.get('/admin/eventdestinations');
	}

	getEventStatuses() {
		return ["accepted", "processing", "on_ledger", "failed"];
	}

	//todo pass in all of the search filters
	search(searchForm: FormGroup, page: number, pageSize: number, sortby: any) {

		const params = {
			text: searchForm.get('querytext').value,
			startdate: searchForm.get('startdate').value,
			enddate: searchForm.get('enddate').value,
			type: searchForm.get('type').value,
			action: searchForm.get('action').value,
			source: searchForm.get('source').value,
			destination: searchForm.get('destination').value,
			status: searchForm.get('status').value,
			pagenumber: page,
			resultsperpage: pageSize,
			sort: JSON.stringify(sortby)
		};

		return this._httpClient.post('/admin/events/search', params);
	}
}
