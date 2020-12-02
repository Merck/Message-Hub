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

import { HubAlertsComponent } from './hub-alerts.component';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('HubAlertsComponent', () => {
	let component: HubAlertsComponent;
	let alertServiceMock: any;
	let translateServiceMock: any;
	let authServiceMock: any;
	let errorHandlerMock: any;
	const successResponse = [{ "time": "07/04/20 16:21:37 UTC", "severity": 1, "source": "event-service", "errorCode": "LG001", "message": "Could not connect to PharmaLedger after 3 attempts." }, { "time": "07/05/20 21:09:14 UTC", "severity": 2, "source": "event-service", "errorCode": "XM001", "message": "Rejected Event from ATTP due to non GS1 compliant XML." }, { "time": "07/05/20 23:22:14 UTC", "severity": 1, "source": "event-service", "errorCode": "RT001", "message": "No routing rules form for GTIN" }]
	const alertSuccessResponse = { "id": 61, "organization_id": 1, "timestamp": "2020-09-02T06:42:20.970Z", "source": "event-service", "severity": "ERROR", "error_code": "EVTS4006", "error_description": "Error in retrieving the event status from Postgres service.", "error_stacktrace": "error: password authentication failed for user \"ibm_cloud_aaa4f9cc_1691_4915_b904_587558c2999b\"\n    at Parser.parseErrorMessage (C:\\Blockchain\\merck\\services\\Event-Service\\node_modules\\pg-protocol\\src\\parser.ts:357:11)\n    at Parser.handlePacket (C:\\Blockchain\\merck\\services\\Event-Service\\node_modules\\pg-protocol\\src\\parser.ts:186:21)\n    at Parser.parse (C:\\Blockchain\\merck\\services\\Event-Service\\node_modules\\pg-protocol\\src\\parser.ts:101:30)\n    at TLSSocket.<anonymous> (C:\\Blockchain\\merck\\services\\Event-Service\\node_modules\\pg-protocol\\src\\index.ts:7:48)\n    at TLSSocket.emit (events.js:315:20)\n    at TLSSocket.EventEmitter.emit (domain.js:483:12)\n    at addChunk (_stream_readable.js:295:12)\n    at readableAddChunk (_stream_readable.js:271:9)\n    at TLSSocket.Readable.push (_stream_readable.js:212:10)\n    at TLSWrap.onStreamRead (internal/stream_base_commons.js:186:23)" };
	beforeEach(async(() => {
		jest.setTimeout(10000);
		translateServiceMock = {
			currentLang: "en"
		}
		alertServiceMock = {
			getAlerts: jest.fn().mockImplementation(() => of(successResponse)),
			getAlert: jest.fn().mockImplementation(() => of(alertSuccessResponse)),
			clearAlert: jest.fn().mockImplementation(() => of(successResponse)),
			clearAlerts: jest.fn().mockImplementation(() => of(successResponse)),
			invokeFirstComponentFunction: of(true)
		};
		authServiceMock = {
			isOrgAdmin: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot(),
				HttpClientModule
			],
			declarations: [HubAlertsComponent]
		});
		component = new HubAlertsComponent(authServiceMock, alertServiceMock, translateServiceMock, errorHandlerMock);
		component.closebutton1 = {
			nativeElement: {
				click() { }
			}
		}
		component.closebutton2 = {
			nativeElement: {
				click() { }
			}
		}
		component.closebutton3 = {
			nativeElement: {
				click() { }
			}
		}
	}));


	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call getAlert function', async () => {
		component.getAlert(29);
		expect(component.alertDetails).toEqual(alertSuccessResponse);
	});
	it('should call clearAlert function', async () => {
		component.clearAlert(29);
		expect(component._alerts).toEqual(successResponse);
	});
	it('should call changePage function', async () => {
		component.changePage(2);
		expect(component._alerts).toEqual(successResponse);
	});
	it('should call clearAll function', async () => {
		component.clearAll();
		expect(component._alerts).toEqual(successResponse);
	});
	it('should call alerts getter function', () => {
		const spy = jest.spyOn(component, 'alerts', 'get');
		const alerts = component.alerts;
		expect(spy).toHaveBeenCalled();
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
	});
	it('should call getAlerts function', async () => {
		const getAlertsServiceSpy = jest.spyOn(alertServiceMock, 'getAlerts').mockReturnValue(of(successResponse))
		component.ngOnInit();
		expect(getAlertsServiceSpy).toBeDefined();
	});


});
