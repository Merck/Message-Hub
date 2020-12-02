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

import {ToolbarAlertsComponent} from './toolbar-alerts.component';
import {of} from 'rxjs';


describe('ToolbarAlertsComponent', () => {
	let component: ToolbarAlertsComponent;
	let alertServiceMock: any;
	let authServiceMock: any;
	let routerMock: any;
	const successResponse = { errorsCount: 20, warningsCount: 23 }

	beforeEach(async(() => {
		alertServiceMock = {
			getAlertNumbers: jest.fn().mockReturnValue(of(successResponse))
		};
		authServiceMock = {
			isOrgAdmin: jest.fn()
		}
		routerMock = {
			navigate: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ToolbarAlertsComponent]
		});
		component = new ToolbarAlertsComponent(authServiceMock, alertServiceMock, routerMock)
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should should call home function', () => {
		component.home();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call total$ getter function', () => {
		const spy = jest.spyOn(component, 'total$', 'get');
		const alerts = component.total$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call errors$ getter function', () => {
		const spy = jest.spyOn(component, 'errors$', 'get');
		const currentLanguage = component.errors$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call warnings$ getter function', () => {
		const spy = jest.spyOn(component, 'warnings$', 'get');
		const currentLanguage = component.warnings$;
		expect(spy).toHaveBeenCalled();
	});
	it('should call isOrgAdmin getter function', () => {
		const spy = jest.spyOn(component, 'isOrgAdmin', 'get');
		const isOrgAdmin = component.isOrgAdmin;
		expect(spy).toHaveBeenCalled();
	});
	it('should call getAlerts function', async () => {
		component.ngOnInit();
		expect(component._errorAlerts).toBeDefined();
		expect(component._warningAlerts).toBeDefined();
	});

});
