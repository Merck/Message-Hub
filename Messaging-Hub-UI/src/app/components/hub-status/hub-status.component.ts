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

import { Component, OnInit } from '@angular/core';
import { StatusService } from '../../services/status-service/status-service.service';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'hub-status',
	templateUrl: './hub-status.component.html',
	styleUrls: ['./hub-status.component.css']
})

export class HubStatusComponent implements OnInit {

	private _status: any = {};
	private _interval: any = null;
	unreachableError: string = "";

	constructor(private _statusService: StatusService, private _authService: AuthenticationService, private errorHandler: GlobalErrorHandler) {
		this._status.status = "UNKNOWN"
	}

	ngOnInit() {
		this.getHubStatus();

		//kick off the refresh of the status check
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getHubStatus();
				}
				else {
					clearInterval(this._interval);
				}
			}, 30000);
		}
	}

	getHubStatus() {
		this.unreachableError = ""
		this._statusService.getHubStatus().subscribe((data: any) => {
			this._status = data;
		}, (err) => {
			this.unreachableError = this.errorHandler.handleError(err);
			this._status.status = "UNREACHABLE";
		});
	}

	get status() {
		return this._status;
	}
}
