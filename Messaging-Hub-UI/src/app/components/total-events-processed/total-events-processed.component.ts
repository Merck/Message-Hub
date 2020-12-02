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
import { Metrics } from '../../models/metrics'
import { MetricsService } from '../../services/metrics-service/metrics-service.service'
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'total-events-processed',
	templateUrl: './total-events-processed.component.html',
	styleUrls: ['./total-events-processed.component.css']
})

export class TotalEventsProcessedComponent implements OnInit {

	_totalProcessedEvent: number = 0;
	_totalProcessedMasterData: number = 0;
	_interval: any = null;
	mainError: string = "";

	ngOnInit() {
		this.getMetrics();

		//kick off the refresh
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getMetrics();
				}
				else {
					clearInterval(this._interval);
				}
			}, 30000);
		}

	}

	constructor(private _metricsService: MetricsService, private _authService: AuthenticationService, private errorHandler: GlobalErrorHandler) {
	}

	getMetrics() {
		this._metricsService.getMetrics().subscribe((data: Metrics) => {
			this._totalProcessedEvent = data.eventMessages;
			this._totalProcessedMasterData = data.masterdataMessages
		}, (err) => {
			this.mainError = this.errorHandler.handleError(err);
		});
	}

	get totalEvent$() {
		if (this._totalProcessedEvent) {
			return new Intl.NumberFormat().format(this._totalProcessedEvent);
		} else {
			return "...";
		}
	};
	get totalMasterData$() {
		if (this._totalProcessedMasterData) {
			return new Intl.NumberFormat().format(this._totalProcessedMasterData);
		} else {
			return "...";
		}
	};
}
