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
import { RoutingService } from '../../services/routing-service/routing-service.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'app-routing-rules-page',
	templateUrl: './routing-rules-page.component.html',
	styleUrls: ['./routing-rules-page.component.css']
})
export class RoutingRulesPageComponent implements OnInit {
	results;
	viewError: string = "";
	showProgress: boolean;

	constructor(private _routingService: RoutingService, private _translateService: TranslateService, private _authService: AuthenticationService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
	}

	viewAt() {
		this.viewError = "";
		this.showProgress = true;
		this._routingService.getRoutingRulesHistory().subscribe((data) => {
			this.results = data;
			this.showProgress = false;

		}, (err) => {
			this.showProgress = false;
			this.viewError = this.errorHandler.handleError(err);
		});
	}

	get currentLanguage() { return this._translateService.currentLang; }
	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}

}
