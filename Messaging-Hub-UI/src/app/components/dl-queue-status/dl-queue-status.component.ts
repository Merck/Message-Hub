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
import { EventService } from '../../services/event-service/event-service.service';
import { DLQueueStatus } from '../../models/dl-queue-status';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { MasterdataService } from '../../services/masterdata-service/masterdata-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'dl-queue-status',
	templateUrl: './dl-queue-status.component.html',
	styleUrls: ['./dl-queue-status.component.css']
})

export class DlQueueStatusComponent implements OnInit {

	_statusEvent: DLQueueStatus;
	_statusMasterData: DLQueueStatus;
	_interval: any = null;
	queueEventError: string = "";
	queueMasterDataError: string = "";
	showProgressEvent: boolean;
	showProgressMasterData: boolean;

	constructor(private _eventService: EventService, private _authService: AuthenticationService, private _masterdataService: MasterdataService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		this.getEventQueueStatus();
		this.getMasterDataQueueStatus();

		//kick off the refresh of the status check
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getEventQueueStatus();
					this.getMasterDataQueueStatus();
				}
				else {
					clearInterval(this._interval);
				}
			}, 30000);
		}
	}

	getEventQueueStatus() {
		this.queueEventError = "";
		this._eventService.getDeadLetterQueue().subscribe((data: DLQueueStatus) => {
			this._statusEvent = data;
		}, (err) => {
			this.queueEventError = this.errorHandler.handleError(err);
		});
	}
	getMasterDataQueueStatus() {
		this.queueMasterDataError = ""
		this._masterdataService.getDeadLetterQueue().subscribe((data: DLQueueStatus) => {
			this._statusMasterData = data;
		}, (err) => {
			this.queueMasterDataError = this.errorHandler.handleError(err);
		});
	}

	retryEvent() {
		this.queueEventError = "";
		this.showProgressEvent = true;
		this._eventService.retryEvent().subscribe((data: DLQueueStatus) => {
			this.getEventQueueStatus();
			this.showProgressEvent = false;
		}, (err) => {
			this.showProgressEvent = false;
			this.queueEventError = this.errorHandler.handleError(err);
		});
	}
	retryMasterData() {
		this.queueMasterDataError = "";
		this.showProgressMasterData = true;
		this._masterdataService.retryMasterData().subscribe((data: DLQueueStatus) => {
			this.getMasterDataQueueStatus();
			this.showProgressMasterData = false;
		}, (err) => {
			this.showProgressMasterData = false;
			this.queueMasterDataError = this.errorHandler.handleError(err);
		});
	}

	get numberEvent() {
		try {
			return this._statusEvent.messageCount;
		} catch (e) {
			return -1;
		}
	}
	get numberMasterData() {
		try {
			return this._statusMasterData.messageCount;
		} catch (e) {
			return -1;
		}
	}
}
