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
import { QueueStatus } from '../../models/queue-status';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { MasterdataService } from '../../services/masterdata-service/masterdata-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'
import { AccountService } from '../../services/account-service/account-service.service';

@Component({
	selector: 'input-queue-status',
	templateUrl: './input-queue-status.component.html',
	styleUrls: ['./input-queue-status.component.css']
})
export class InputQueueStatusComponent implements OnInit {

	_status: QueueStatus;
	_queueStatus;
	_interval: any = null;
	EventError: string = "";
	MasterDataError: string = "";
	showProgressEvent: boolean;
	showProgressMasterData: boolean;

	constructor(private _eventService: EventService, private _authService: AuthenticationService, private _masterdataService: MasterdataService, private errorHandler: GlobalErrorHandler, private _accountService: AccountService) { }

	ngOnInit() {
		this.getQueueStatus();
		this.getPauseResumeStatus();

		//kick off the refresh of the status check
		if (this._interval === null) {
			this._interval = setInterval(() => {
				if (this._authService.getToken()) {
					this.getQueueStatus();
				}
				else {
					clearInterval(this._interval);
				}
			}, 30000);
		}
	}

	getQueueStatus() {
		this.EventError = "";
		this.MasterDataError = ""
		this._eventService.getProcessingQueue().subscribe((data: QueueStatus) => {
			this._status = data;
		}, (err) => {
			this.EventError = this.errorHandler.handleError(err);
			this.MasterDataError = this.errorHandler.handleError(err);
		});
	}
	getPauseResumeStatus() {
		this._eventService.getProcessingQueueStatus().subscribe((data: QueueStatus) => {
			this._queueStatus = data;
			console.log(data);

		}, (err) => {
			this.EventError = this.errorHandler.handleError(err);
			this.MasterDataError = this.errorHandler.handleError(err);
		});
	}

	pauseEvent() {
		this.EventError = "";
		this.showProgressEvent = true;
		this._eventService.pauseEvent(this.masterDataPaused, this._accountService.getUsername()).subscribe(data => {
			this.getQueueStatus();
			this.getPauseResumeStatus();
			this.showProgressEvent = false;
		},
			(err) => {
				this.showProgressEvent = false;
				this.EventError = this.errorHandler.handleError(err);
			})
	}
	resumeEvent() {
		this.EventError = "";
		this.showProgressEvent = true;
		this._eventService.resumeEvent(this.masterDataPaused, this._accountService.getUsername()).subscribe(data => {
			this.getQueueStatus();
			this.getPauseResumeStatus();
			this.showProgressEvent = false;
		},
			(err) => {
				this.showProgressEvent = false;
				this.EventError = this.errorHandler.handleError(err);
			})
	}
	pauseMasterData() {
		this.MasterDataError = "";
		this.showProgressMasterData = true;
		this._masterdataService.pauseMasterData(this.eventPaused, this._accountService.getUsername()).subscribe(data => {
			this.getQueueStatus();
			this.getPauseResumeStatus();
			this.showProgressMasterData = false;
		},
			(err) => {
				this.showProgressMasterData = false;
				this.MasterDataError = this.errorHandler.handleError(err);
			})
	}
	resumeMasterData() {
		this.MasterDataError = "";
		this.showProgressMasterData = true;
		this._masterdataService.resumeMasterData(this.eventPaused, this._accountService.getUsername()).subscribe(data => {
			this.getQueueStatus();
			this.getPauseResumeStatus();
			this.showProgressMasterData = false;
		},
			(err) => {
				this.showProgressMasterData = false;
				this.MasterDataError = this.errorHandler.handleError(err);
			})
	}

	get numberEvent() {
		try {
			return this._status.eventQueue.messageCount;
		} catch (e) {
			return -1;
		}
	}
	get numberMasterData() {
		try {
			return this._status.masterdataQueue.messageCount;
		} catch (e) {
			return -1;
		}
	}
	get eventPaused() {
		try {
			return this._queueStatus.events_paused ? this._queueStatus.events_paused : false;
		} catch (e) {
			return -1;
		}
	}
	get masterDataPaused() {
		try {
			return this._queueStatus.masterdata_paused ? this._queueStatus.masterdata_paused : false;
		} catch (e) {
			return -1;
		}
	}
}
