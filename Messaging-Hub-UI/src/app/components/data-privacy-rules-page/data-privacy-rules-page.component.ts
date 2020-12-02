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
import { PrivacyService } from '../../services/privacy-service/privacy-service.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'data-privacy-rules-page',
	templateUrl: './data-privacy-rules-page.component.html',
	styleUrls: ['./data-privacy-rules-page.component.css']
})

export class DataPrivacyRulesPageComponent implements OnInit {
	results;
	viewError: string = "";
	showProgress: boolean;

	constructor(private _privacyService: PrivacyService,
		private _translateService: TranslateService, private _authService: AuthenticationService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {

	}
	viewAt() {
		this.viewError = "";
		this.showProgress = true;
		this._privacyService.getPrivacyRulesHistory().subscribe((data) => {
			this.results = data;
			this.showProgress = false;

		}, (err) => {
			this.viewError = this.errorHandler.handleError(err);
			this.showProgress = false;
		});
	}
	privacySetting(val: boolean) {
		if (val) {
			return "store"
		}
		else {
			return "doNotStore"
		}
	}
	get currentLanguage() { return this._translateService.currentLang; }
	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}
}
