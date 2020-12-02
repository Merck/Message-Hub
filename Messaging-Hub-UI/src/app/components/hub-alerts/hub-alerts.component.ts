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

import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '../../services/alert-service/alert-service.service'
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { Alert } from '../../models/alert'
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'hub-alerts',
	templateUrl: './hub-alerts.component.html',
	styleUrls: ['./hub-alerts.component.css']
})

export class HubAlertsComponent implements OnInit {
	@ViewChild('closebutton1', { static: false }) closebutton1;
	@ViewChild('closebutton2', { static: false }) closebutton2;
	@ViewChild('closebutton3', { static: false }) closebutton3;
	_alerts: Alert;
	_interval: any = null;
	alertDetails: any;
	page: number = 1;
	showProgress: boolean;
	alertsError: string = "";
	alertError: string = "";
	clearAlertsError: string = "";

	constructor(private _authService: AuthenticationService, private _alertService: AlertService, private _translateService: TranslateService, private errorHandler: GlobalErrorHandler) {
	}


	ngOnInit() {
		if (this._alertService.subsVar == undefined) {
			this._alertService.subsVar = this._alertService.
				invokeFirstComponentFunction.subscribe((name: string) => {
					this.getAlerts(this.page);
				});
		}
		this.getAlerts(this.page);

		//kick off the refresh of the status check
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getAlerts(this.page);
				}
				else {
					clearInterval(this._interval);
				}
			}, 30000);
		}
	}

	getAlerts(page) {
		this.alertsError = ""
		this._alertService.getAlerts(page).subscribe((data: any) => {
			this._alerts = data;
		}, (err) => {
			this.alertsError = this.errorHandler.handleError(err);
		});
	}

	getAlert(id) {
		this.alertError = ""
		this._alertService.getAlert(id).subscribe((data: any) => {
			this.alertDetails = data;
		}, (err) => {
			this.alertError = this.errorHandler.handleError(err);
		});
	}

	clearAlert(id) {
		this.alertError = ""
		this.showProgress = true;
		this._alertService.clearAlert(id).subscribe((data: any) => {
			this.getAlerts(this.page);
			this.showProgress = false;
			this.closebutton1.nativeElement.click();
			this.closebutton2.nativeElement.click();
		}, (err) => {
			this.alertError = this.errorHandler.handleError(err);
			this.showProgress = false;
			this.closebutton2.nativeElement.click();
		});
	}

	changePage(page: number) {
		this.page = page;
		this.getAlerts(page);
	}
	clearAll() {
		this.clearAlertsError = ""
		this.showProgress = true;
		this._alertService.clearAlerts().subscribe(data => {
			this.showProgress = false;
			this.getAlerts(1);
			this.closebutton3.nativeElement.click();
		}, (err) => {
			this.showProgress = false;
			this.clearAlertsError = this.errorHandler.handleError(err);
		});
	}

	get alerts() {
		return this._alerts;
	}

	get currentLanguage() {
		return this._translateService.currentLang;
	}

	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}
}
