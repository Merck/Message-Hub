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

import {async, TestBed} from '@angular/core/testing';

import {ToolbarSearchComponent} from './toolbar-search.component';
import {FormBuilder} from '@angular/forms';

describe('ToolbarSearchComponent', () => {
	let component: ToolbarSearchComponent;
	let routerMock: any;
	const formBuilder: FormBuilder = new FormBuilder();

	beforeEach(async(() => {
		routerMock = {
			navigate: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ToolbarSearchComponent]
		});

		component = new ToolbarSearchComponent(routerMock);
		component.toolbarSearchForm = formBuilder.group({
			toolbarquerytext: ['']
		});
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should search', () => {
		component.toolbarSearchForm.controls.toolbarquerytext.setValue('abc');
		component.search();
		expect(routerMock.navigate).toBeDefined();
	});
});
