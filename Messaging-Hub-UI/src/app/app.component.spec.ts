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

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { of } from 'rxjs';

describe('AppComponent', () => {
	let component: AppComponent;
	let authServiceMock: any;
	let translateServiceMock: any;
	let alertServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "queueName": "Merck123_DeadLetter_Queue", "messageCount": 6 }]

	beforeEach(async(() => {
		translateServiceMock = {
			setDefaultLang: jest.fn(),
			addLangs: jest.fn(),
			use: jest.fn()
		}
		authServiceMock = {
			isLoggedIn: jest.fn()
		};
		alertServiceMock = {
			clearAlerts: jest.fn().mockImplementation(() => of(successResponse)),
			onFirstComponentButtonClick: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule
			],
			declarations: [
				AppComponent
			]
		});
		component = new AppComponent(translateServiceMock, authServiceMock, alertServiceMock, errorHandlerMock);
		component.closebutton = {
			nativeElement: {
				click() { }
			}
		}
	}));

	it('should create the app', () => {

		expect(component).toBeDefined();
	});

	it(`should have as title 'admin-ui'`, () => {
		expect(component.title).toBe('admin-ui');
	});
	it(`should call clearAll function'`, () => {
		component.clearAll();
		expect(component.clearAll).toBeDefined();
	});
	it(`should call close function'`, () => {
		component.close();
		expect(component.clearAlertError).toEqual("");
	});
	it(`should be loggedin'`, () => {
		expect(component.loggedin).toBeTruthy;
	});
	it(`should be loggedin'`, () => {
		expect(component.loggedin).toBeFalsy;
	});
});
