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
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class MetricsService {

	constructor(private _httpClient: HttpClient) { }

	getMetrics() {
		return this._httpClient.get('/admin/metrics/events/processed')
	}
	getDestinationData() {
		return this._httpClient.get('/admin/metrics/events/destination')
	}
	getSourceData() {
		return this._httpClient.get('/admin/metrics/events/source')
	}
	getStatusData() {
		return this._httpClient.get('/admin/metrics/events/status')
	}
	getTypeData() {
		return this._httpClient.get('/admin/metrics/events/type')
	}
	getPeriodData(duration) {
		let params = new HttpParams();
		params = params.append('duration', duration);
		return this._httpClient.get('/admin/metrics/events/period', { params: params })
	}
}
