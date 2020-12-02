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

import { RoutingRulesPageComponent } from './routing-rules-page.component';
import { of } from 'rxjs';

describe('RoutingRulesPageComponent', () => {
	let routingServiceMock: any;
	let translateServiceMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]

	let component: RoutingRulesPageComponent;
	beforeEach(async(() => {
		routingServiceMock = {
			getRoutingRulesHistory: jest.fn().mockImplementation(() => of(successResponse))
		}
		translateServiceMock = {
			currentLang: "en"
		}
		authServiceMock = {
			isOrgAdmin: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [RoutingRulesPageComponent]
		});
		component = new RoutingRulesPageComponent(routingServiceMock, translateServiceMock, authServiceMock, errorHandlerMock);
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call viewAt', () => {
		component.viewAt();
		expect(component.results).toBeDefined();
	});
	it('should call currentLanguage getter function', () => {
		const spy = jest.spyOn(component, 'currentLanguage', 'get');
		const currentLanguage = component.currentLanguage;
		expect(spy).toHaveBeenCalled();
	});
	it('should call isOrgAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isOrgAdmin', 'get');
		const isOrgAdmin = component.isOrgAdmin;
		expect(spy).toHaveBeenCalled();
	})
});
