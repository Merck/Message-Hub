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

@Injectable({
	providedIn: 'root'
})

export class EventService {

	constructor(private _httpClient: HttpClient) { }

	getProcessingQueue() {
		//todo pass access token in the request
		return this._httpClient.get('/admin/events/status/processing');
	}
	getProcessingQueueStatus() {
		return this._httpClient.get('/admin/queuestatus');
	}
	getDeadLetterQueue() {
		//todo pass access token in the request
		return this._httpClient.get('/admin/events/failed');
	}

	getEvent(eventId: string) {
		return this._httpClient.get('/admin/events/' + eventId);
	}
	pauseEvent(masterDataPaused: boolean, updatedBy: string) {
		const params = {
			events_paused: true,
			masterdata_paused: masterDataPaused,
			updated_by: updatedBy
		};
		return this._httpClient.post('/admin/events/queuestatus', params);
	}
	resumeEvent(masterDataPaused: boolean, updatedBy: string) {
		const params = {
			events_paused: false,
			masterdata_paused: masterDataPaused,
			updated_by: updatedBy
		};
		return this._httpClient.post('/admin/events/queuestatus', params);
	}
	retryEvent() {
		return this._httpClient.get('admin/events_retry');
	}
	getBCData(id, adapter) {
		return this._httpClient.get('/admin/events/' + id + '/blockchain/' + adapter);
	}
}
