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
import { of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MasterdataService {

	constructor(private _httpClient: HttpClient) { }

	getAllMasterdata() {
		return this._httpClient.get('/admin/masterdata');
	}
	getData(id: string) {
		return this._httpClient.get('/admin/masterdata/' + id);
	}
	pauseMasterData(eventPaused: boolean, updatedBy: string) {
		const params = {
			events_paused: eventPaused,
			masterdata_paused: true,
			updated_by: updatedBy
		};
		return this._httpClient.post('/admin/masterdata/queuestatus', params);
	}
	resumeMasterData(eventPaused: boolean, updatedBy: string) {
		const params = {
			events_paused: eventPaused,
			masterdata_paused: false,
			updated_by: updatedBy
		};
		return this._httpClient.post('/admin/masterdata/queuestatus', params);
	}
	getDeadLetterQueue() {
		return this._httpClient.get('/admin/masterdata/status/failed');
	}
	retryMasterData() {
		return this._httpClient.get('/admin/masterdata_retry');
	}
	getBCData(id, adapter) {
		return this._httpClient.get('/admin/masterdata/' + id + '/blockchain/' + adapter);
	}
}
