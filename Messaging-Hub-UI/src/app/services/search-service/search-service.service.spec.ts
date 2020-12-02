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

import {SearchService} from './search-service.service';
import {FormControl, FormGroup} from '@angular/forms';

describe('SearchService', () => {
	let service: SearchService;
	const http = jest.fn();
	beforeEach(() => {
		service = new SearchService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should get Event Types', () => {
		service.getEventTypes();
		expect(service.getEventTypes()).not.toBeNull();
	});
	it('should get Event Actions', () => {
		service.getEventActions();
		expect(service.getEventActions()).not.toBeNull();
	});
	it('should get Event Sources', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new SearchService(httpMock as any);
		serviceMock.getEventSources();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get Event Destinations', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new SearchService(httpMock as any);
		serviceMock.getEventDestinations();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should get Event Statuses', () => {
		service.getEventStatuses();
		expect(service.getEventStatuses()).not.toBeNull();
	});
	it('should call search', done => {
		const httpMock = {
			post: jest.fn()
		}
		const searchForm = new FormGroup({
			'querytext': new FormControl(''),
			'startdate': new FormControl(''),
			'enddate': new FormControl(''),
			'type': new FormControl(''),
			'action': new FormControl(''),
			'source': new FormControl(''),
			'destination': new FormControl(''),
			'status': new FormControl('')
		});
		const serviceMock = new SearchService(httpMock as any);
		serviceMock.search(searchForm, 1, 1, []);
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});

});
