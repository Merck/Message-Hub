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

import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DateAdapter} from '@angular/material/core';

@Component({
	selector: 'language-selector',
	templateUrl: './language-selector.component.html',
	styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {

	constructor(private translate: TranslateService, private dateAdapter: DateAdapter<Date>) {
	}

	ngOnInit() {
	}

	useLanguage(language: string) {
		this.translate.use(language);
		this.dateAdapter.setLocale(language);
	}

	get currentLanguage() {
		return this.translate.currentLang;
	}

	get availableLanguages() {
		return this.translate.getLangs();
	}
}
