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

import {StatusService} from './status-service.service';

describe('StatusService', () => {
	let service: StatusService;
	const http = jest.fn();
	beforeEach(() => {
		service = new StatusService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should call getHubStatus', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new StatusService(httpMock as any);
		serviceMock.getHubStatus();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
});
