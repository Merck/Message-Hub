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
import { GlobalErrorHandler } from './errorHandler';

describe('ToolbarSearchComponent', () => {
	let component: GlobalErrorHandler;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GlobalErrorHandler]
		});
		component = new GlobalErrorHandler();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call handleError', () => {
		const spy = component.handleError({ status: 400 });
		expect(spy).toEqual("400");
	});
	it('should call handleError', () => {
		const spy = component.handleError('');
		expect(spy).toEqual("");
	});
});
