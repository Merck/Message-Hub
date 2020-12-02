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

import { TotalEventsProcessedComponent } from './total-events-processed.component';
import { of } from 'rxjs';

describe('TotalEventsProcessedComponent', () => {
	let component: TotalEventsProcessedComponent;
	let metricsServiceMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = { "totalProcessed": 5321 }
	beforeEach(async(() => {
		metricsServiceMock = {
			getMetrics: jest.fn().mockImplementation(() => of(successResponse))
		};
		authServiceMock = {
			getToken: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [TotalEventsProcessedComponent]
		});
		component = new TotalEventsProcessedComponent(metricsServiceMock, authServiceMock, errorHandlerMock);

	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});

	it('should call totalEvent$ getter function', () => {
		component._totalProcessedEvent = 1234;
		const spy = jest.spyOn(component, 'totalEvent$', 'get');
		const alerts = component.totalEvent$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call totalEvent$ getter function with null value', () => {
		component._totalProcessedEvent = 0;
		const spy = jest.spyOn(component, 'totalEvent$', 'get');
		const alerts = component.totalEvent$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call totalMasterData$ getter function', () => {
		component._totalProcessedMasterData = 1234;
		const spy = jest.spyOn(component, 'totalMasterData$', 'get');
		const isOrgAdmin = component.totalMasterData$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call totalMasterData$ getter function with null value', () => {
		component._totalProcessedMasterData = 0;
		const spy = jest.spyOn(component, 'totalMasterData$', 'get');
		const isOrgAdmin = component.totalMasterData$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call getMetrics function', async () => {
		const getAlertsServiceSpy = jest.spyOn(metricsServiceMock, 'getMetrics').mockReturnValue(of(successResponse))
		component.ngOnInit();
		expect(getAlertsServiceSpy).toBeDefined();
	});
});
