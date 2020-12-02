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

import { TestBed } from '@angular/core/testing';

import { MetricsService } from './metrics-service.service';

describe('MetricsService', () => {
	let service: MetricsService;
	const http = jest.fn();
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [MetricsService]
		});
		service = new MetricsService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should get metrics', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getMetrics();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get destination data', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getDestinationData();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get source data', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getSourceData();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get status data', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getStatusData();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get type data', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getTypeData();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get period data', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new MetricsService(httpMock as any);
		serviceMock.getPeriodData('week');
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
});
