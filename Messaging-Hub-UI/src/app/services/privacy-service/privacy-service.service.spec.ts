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

import {PrivacyService} from './privacy-service.service';
import {FormControl, FormGroup} from '@angular/forms';

describe('PrivacyService', () => {
	let service: PrivacyService;
	const http = jest.fn();

	beforeEach(() => {
		service = new PrivacyService(http as any);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should be able to get all the privacy rules', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.getAllPrivacyRules();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should be able to add a privacy rule', done => {
		const httpMock = {
			post: jest.fn()
		}
		const control = new FormGroup({
			dataElement: new FormControl('1'),
			privacySettings: new FormControl(true)
		});
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.addPrivacyRule(control, 8, "xxx");
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should be able to edit a privacy rule', done => {
		const httpMock = {
			patch: jest.fn()
		}
		const control = new FormGroup({
			dataElement: new FormControl('1'),
			privacySettings: new FormControl(true)
		});
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.editPrivacyRule(control, 8, "xxx", 27);
		expect(httpMock.patch).toBeDefined();
		expect(httpMock.patch).toHaveBeenCalled();
		done();
	});
	it('should be able to delete a privacy rule', done => {
		const httpMock = {
			delete: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.deletePrivacyRule(27, "xxx");
		expect(httpMock.delete).toBeDefined();
		expect(httpMock.delete).toHaveBeenCalled();
		done();
	});
	it('should be able to reorder privacy rules', done => {
		const httpMock = {
			patch: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.reorderPrivacyRule(["27", "24", "22"], "xxx");
		expect(httpMock.patch).toBeDefined();
		expect(httpMock.patch).toHaveBeenCalled();
		done();
	});
	it('should be able to get a privacy rule', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.getPrivacyRule(27);
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should be able to get data elements', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.getDataElement();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
	it('should be able to get all the privacy rules history', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new PrivacyService(httpMock as any);
		serviceMock.getPrivacyRulesHistory();
		expect(httpMock.get).toBeDefined();
		expect(httpMock.get).toHaveBeenCalled();
		done();
	});
});
