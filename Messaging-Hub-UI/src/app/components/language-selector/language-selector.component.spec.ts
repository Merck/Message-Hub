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

import {LanguageSelectorComponent} from './language-selector.component';

describe('LanguageSelectorComponent', () => {
	let component: LanguageSelectorComponent;
	let translateServiceMock: any;
	let dateAdapterMock: any;

	beforeEach(async(() => {
		dateAdapterMock = {
			setLocale: jest.fn()
		}
		translateServiceMock = {
			use: jest.fn(),
			getLangs: jest.fn(),
			currentLang: 'en'
		}
		TestBed.configureTestingModule({
			declarations: [LanguageSelectorComponent]
		});
		component = new LanguageSelectorComponent(translateServiceMock, dateAdapterMock);
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call useLanguage function', () => {
		const useSpy = jest.spyOn(translateServiceMock, 'use');
		const setLocaleSpy = jest.spyOn(dateAdapterMock, 'setLocale');
		component.useLanguage('en');
		expect(useSpy).toHaveBeenCalled();
		expect(setLocaleSpy).toHaveBeenCalled();
	});
	it('should call currentLanguage getter function', () => {
		const spy = jest.spyOn(component, 'currentLanguage', 'get');
		const password = component.currentLanguage;
		expect(spy).toHaveBeenCalled();
	});
	it('should call availableLanguages getter function', () => {
		const spy = jest.spyOn(component, 'availableLanguages', 'get');
		const password = component.availableLanguages;
		expect(spy).toHaveBeenCalled();
	});
});
