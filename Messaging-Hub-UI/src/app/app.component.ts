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

import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './services/authentication-service/authentication-service.service';

import { registerLocaleData } from '@angular/common';
import { GlobalErrorHandler } from './shared/errorHandler';

/**
  LANGUAGE SUPPORT - Add any locales here to support time/date,
  currency conversions
 **/
import localeDE from '@angular/common/locales/de';
import { AlertService } from './services/alert-service/alert-service.service';
registerLocaleData(localeDE);

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {
	@ViewChild('closebutton', { static: false }) closebutton;
	title = 'admin-ui';
	clearAlertError: string = "";
	showProgress: boolean;

	constructor(private translate: TranslateService, private authService: AuthenticationService, private _alertService: AlertService, private errorHandler: GlobalErrorHandler) {
		translate.setDefaultLang('en');

		/**
		  LANGUAGE SUPPORT - Add the languages here along with a translation
		  JSON file in app/assets/i18n
		**/

		translate.addLangs(['en', 'de']);
		translate.use('en');
	}
	clearAll() {
		this.clearAlertError = "";
		this.showProgress = true;
		this._alertService.clearAlerts().subscribe(data => {
			this._alertService.onFirstComponentButtonClick();
			this.closebutton.nativeElement.click();
			this.showProgress = false;
		}, (err) => {
			this.clearAlertError = this.errorHandler.handleError(err);
			this.showProgress = false;
		});
	}
	close() {
		this.clearAlertError = "";
	}

	get loggedin() {
		return this.authService.isLoggedIn();
	}
}
