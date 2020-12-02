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

import { AlertService } from './alert-service.service';
import { jest } from '@jest/globals'

describe('AlertService', () => {
	let service: AlertService;
	const http = jest.fn();
	jest.disableAutomock();
	beforeEach(() => {
		service = new AlertService(http as any);
	});

	it('should exist', () => {

		expect(service).toBeDefined();
	});
	it('should get all the alerts', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AlertService(httpMock as any);
		serviceMock.getAlerts(1);
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get alert details', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AlertService(httpMock as any);
		serviceMock.getAlert(1);
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should clear all alerts', done => {
		const httpMock = {
			delete: jest.fn()
		}
		const serviceMock = new AlertService(httpMock as any);
		serviceMock.clearAlerts();
		expect(httpMock.delete).toBeDefined();
		expect(httpMock.delete).toHaveBeenCalled();
		done();
	});
	it('should clear an alerts', done => {
		const httpMock = {
			delete: jest.fn()
		}
		const serviceMock = new AlertService(httpMock as any);
		serviceMock.clearAlert(2);
		expect(httpMock.delete).toBeDefined();
		expect(httpMock.delete).toHaveBeenCalled();
		done();
	});
	it('should clear an alerts', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AlertService(httpMock as any);
		serviceMock.getAlertNumbers();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should clear an alerts', done => {
		spyOn(service.invokeFirstComponentFunction, 'emit')
		service.onFirstComponentButtonClick();
		expect(service.invokeFirstComponentFunction.emit).toHaveBeenCalled();
		done();
	});
});
