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

import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class AlertService {
	invokeFirstComponentFunction = new EventEmitter();
	subsVar: Subscription;

	constructor(private httpClient: HttpClient) { }

	getAlerts(pagenumber) {
		//todo pass access token in the request
		let params = new HttpParams();
		params = params.append('pagenumber', pagenumber);
		return this.httpClient.get('/admin/alerts', { params: params });
	}
	getAlert(id) {
		return this.httpClient.get('/admin/alerts/' + id);
	}
	clearAlerts() {
		return this.httpClient.delete('/admin/alerts');
	}
	clearAlert(id) {
		return this.httpClient.delete('/admin/alerts/' + id);
	}
	getAlertNumbers() {
		return this.httpClient.get('/admin/alertscount')
	}
	onFirstComponentButtonClick() {
		this.invokeFirstComponentFunction.emit();
	}
}
