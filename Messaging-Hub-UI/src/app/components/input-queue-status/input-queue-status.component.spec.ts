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

import { InputQueueStatusComponent } from './input-queue-status.component';
import { of } from 'rxjs';

describe('InputQueueStatusComponent', () => {
	let component: InputQueueStatusComponent;
	let eventServiceMock: any;
	let authServiceMock: any;
	let masterdataServiceMock: any;
	let errorHandlerMock: any;
	let accountServiceMock: any;
	const successResponse = { "processingStatus": "running", "queueName": "Merck123_Input_Queue", "messageCount": 371 }
	beforeEach(async(() => {
		eventServiceMock = {
			getProcessingQueue: jest.fn().mockImplementation(() => of(successResponse)),
			getProcessingQueueStatus: jest.fn().mockImplementation(() => of(successResponse)),
			pauseEvent: jest.fn().mockImplementation(() => of(successResponse)),
			resumeEvent: jest.fn().mockImplementation(() => of(successResponse))
		}
		authServiceMock = {
			getToken: jest.fn()
		}
		masterdataServiceMock = {
			pauseMasterData: jest.fn().mockImplementation(() => of(successResponse)),
			resumeMasterData: jest.fn().mockImplementation(() => of(successResponse))
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		accountServiceMock = {
			getUsername: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [InputQueueStatusComponent]
		});
		component = new InputQueueStatusComponent(eventServiceMock, authServiceMock, masterdataServiceMock, errorHandlerMock, accountServiceMock);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call pauseEvent function', async () => {
		component.pauseEvent();
		expect(component._status).toBeDefined();
	});
	it('should call resumeEvent function', async () => {
		component.resumeEvent();
		expect(component._status).toBeDefined();
	});
	it('should call pauseMasterData function', async () => {
		component.pauseMasterData();
		expect(component._status).toBeDefined();
	});
	it('should call resumeMasterData function', async () => {
		component.resumeMasterData();
		expect(component._status).toBeDefined();
	});
	it('should call numberEvent getter function', () => {
		const spy = jest.spyOn(component, 'numberEvent', 'get');
		const number = component.numberEvent;
		expect(spy).toHaveBeenCalled();
	});
	it('should call numberMasterData getter function', () => {
		const spy = jest.spyOn(component, 'numberMasterData', 'get');
		const number = component.numberMasterData;
		expect(spy).toHaveBeenCalled();
	});
	// it('should call runningEvent getter function', () => {
	// 	const spy = jest.spyOn(component, 'runningEvent', 'get');
	// 	const number = component.runningEvent;
	// 	expect(spy).toHaveBeenCalled();
	// });
	// it('should call runningMasterData getter function', () => {
	// 	const spy = jest.spyOn(component, 'runningMasterData', 'get');
	// 	const number = component.runningMasterData;
	// 	expect(spy).toHaveBeenCalled();
	// });
	it('should call getQueueStatus function', async () => {
		component.ngOnInit();
		const getProcessingQueueSpy = jest.spyOn(eventServiceMock, 'getProcessingQueue').mockReturnValue(of(successResponse));
		expect(getProcessingQueueSpy).toBeDefined();
	});
});
