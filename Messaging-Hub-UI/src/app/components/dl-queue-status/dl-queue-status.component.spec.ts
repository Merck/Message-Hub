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

import { async, TestBed } from '@angular/core/testing';

import { DlQueueStatusComponent } from './dl-queue-status.component';
import { of } from 'rxjs';

describe('DlQueueStatusComponent', () => {
	let component: DlQueueStatusComponent;
	let eventServiceMock: any;
	let authServiceMock: any;
	let masterdataSericeMock: any;
	let errorHandlerMock: any;
	const successResponse = { "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }
	beforeEach(async(() => {
		eventServiceMock = {
			getDeadLetterQueue: jest.fn().mockImplementation(() => of(successResponse)),
			retryEvent: jest.fn().mockImplementation(() => of(successResponse))
		}
		authServiceMock = {
			getToken: jest.fn()
		}
		masterdataSericeMock = {
			getDeadLetterQueue: jest.fn().mockImplementation(() => of(successResponse)),
			retryMasterData: jest.fn().mockImplementation(() => of(successResponse))
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [DlQueueStatusComponent]
		});
		component = new DlQueueStatusComponent(eventServiceMock, authServiceMock, masterdataSericeMock, errorHandlerMock);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call retryEvent function', () => {
		component.retryEvent();
		expect(component._statusEvent).toEqual(successResponse);
	});
	it('should call retryMasterData function', () => {
		component.retryMasterData();
		expect(component._statusMasterData).toEqual(successResponse);
	});
	it('should call numberEvent getter function', () => {
		const spy = jest.spyOn(component, 'numberEvent', 'get');
		const status = component.numberEvent;
		expect(spy).toHaveBeenCalled();
	});
	it('should call numberMasterData getter function', () => {
		const spy = jest.spyOn(component, 'numberMasterData', 'get');
		const status = component.numberMasterData;
		expect(spy).toHaveBeenCalled();
	});
	it('should call getQueueStatus function', () => {
		component.ngOnInit();
		expect(component._statusEvent).toEqual(successResponse);
		expect(component._statusMasterData).toEqual(successResponse);
	});

});
