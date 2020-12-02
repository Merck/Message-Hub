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

import { HubStatusComponent } from './hub-status.component';
import { of } from 'rxjs';

describe('HubStatusComponent', () => {
	let component: HubStatusComponent;
	let statusServiceMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = { "status": "UP" }

	beforeEach(async(() => {
		statusServiceMock = {
			getHubStatus: jest.fn().mockImplementation(() => of(successResponse))
		}
		authServiceMock = {
			getToken: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [HubStatusComponent]
		});
		component = new HubStatusComponent(statusServiceMock, authServiceMock, errorHandlerMock);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call status getter function', () => {
		const spy = jest.spyOn(component, 'status', 'get');
		const status = component.status;
		expect(spy).toHaveBeenCalled();
	});
	it('should call getHubStatus function', () => {
		component.ngOnInit();
		const getHubStatusSpy = jest.spyOn(statusServiceMock, 'getHubStatus').mockReturnValue(of(successResponse));
		expect(getHubStatusSpy).toBeDefined();
	});

});
