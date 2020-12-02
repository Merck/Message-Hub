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

import { AppDateAdapter } from './format-datepicker';
import { Platform } from '@angular/cdk/platform';
import { DateAdapter } from '@angular/material';

describe('ToolbarSearchComponent', () => {
	let component: AppDateAdapter;
	let DateArg = "en";

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [DateAdapter],
			declarations: [AppDateAdapter]
		});
		component = new AppDateAdapter(DateArg, new Platform);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call format', () => {
		const date = new Date();
		const displayFormat = 'input';
		component.format(date, displayFormat);
		expect(component.format).not.toBeNull();
	});
	it('should call format', () => {
		const date = new Date();
		const displayFormat = '';
		component.format(date, displayFormat);
		expect(component.format).not.toBeNull();
	});
});
