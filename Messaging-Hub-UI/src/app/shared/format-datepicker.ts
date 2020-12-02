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

import {NativeDateAdapter} from '@angular/material';
import {MatDateFormats} from '@angular/material/core';
import {DatePipe, formatDate} from '@angular/common';

export class AppDateAdapter extends NativeDateAdapter {
	format(date: Date, displayFormat: Object): string {
		if (displayFormat === 'input') {
			return formatDate(date, 'dd-MMM-yyyy', this.locale);;
		} else {
			return new DatePipe(this.locale).transform(date, 'MMM yyyy');
		}
	}
}
export const APP_DATE_FORMATS: MatDateFormats = {
	parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
	display: {
		dateInput: 'input',
		monthYearLabel: { year: 'numeric', month: 'short' },
		dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
		monthYearA11yLabel: { year: 'numeric', month: 'long' }
	}
};
