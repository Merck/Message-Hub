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

import {async, TestBed} from '@angular/core/testing';

import {LandingPageComponent} from './landing-page.component';

describe('LandingPageComponent', () => {
	let component: LandingPageComponent;
	let authServiceMock: any;

	beforeEach(async(() => {
		authServiceMock = {
			isHubAdmin: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [LandingPageComponent]
		});
		component = new LandingPageComponent(authServiceMock);
		component.ngOnInit();
	}));


	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call isHubAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isHubAdmin', 'get');
		const isOrgAdmin = component.isHubAdmin;
		expect(spy).toHaveBeenCalled();
	});
});
