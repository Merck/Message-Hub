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
import { AlertService } from '../../services/alert-service/alert-service.service'
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { Router } from '@angular/router';

@Component({
	selector: 'toolbar-alerts',
	templateUrl: './toolbar-alerts.component.html',
	styleUrls: ['./toolbar-alerts.component.css']
})

export class ToolbarAlertsComponent implements OnInit {

	_interval: any = null;
	_errorAlerts: number = 0;
	_warningAlerts: number = 0;

	ngOnInit() {
		this.getAlerts();

		//kick off the refresh of the alert check
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getAlerts();
				}
				else {
					clearInterval(this._interval);
				}
			}, 6000);
		}
	}

	constructor(private _authService: AuthenticationService, private _alertService: AlertService, private router: Router) {
	}

	getAlerts() {
		this._alertService.getAlertNumbers().subscribe((data: any) => {
			this._errorAlerts = data.errorsCount;
			this._warningAlerts = data.warningsCount;
		}, (err) => {
			console.log(err);
			this._errorAlerts = 0;
			this._warningAlerts = 0;
		});
	}

	home() {
		this.router.navigate(['/home']);
	}

	get total$() { return this._errorAlerts + this._warningAlerts }
	get errors$() { return this._errorAlerts }
	get warnings$() { return this._warningAlerts }
	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}
}
