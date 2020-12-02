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

import { EventService } from './event-service.service';

describe('EventService', () => {
	let service: EventService;
	const http = jest.fn();
	beforeEach(() => {
		service = new EventService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should call getProcessingQueue', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.getProcessingQueue();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should call getProcessingQueueStatus', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.getProcessingQueueStatus();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should call getDeadLetterQueue', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.getDeadLetterQueue();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should call getEvent', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.getEvent("123");
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should call pauseEvent', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.pauseEvent(true, "abc");
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should call resumeEvent', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.resumeEvent(true, "abc");
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should call retryEvent', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.retryEvent();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should call getBCData', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new EventService(httpMock as any);
		serviceMock.getBCData(123, "abc");
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
});
