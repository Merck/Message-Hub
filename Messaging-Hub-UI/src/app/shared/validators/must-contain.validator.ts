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

import {AbstractControl} from '@angular/forms';

// custom validator to check that two fields match
export function MustContain(comparator: string) {
	let valueControl: (AbstractControl | undefined);
	let comparatorControl: (AbstractControl | undefined);
	return (control: AbstractControl): { [key: string]: boolean } | null => {
		if (!control.parent) {
			return null;
		}
		if (!valueControl) {

			valueControl = control;
			comparatorControl = (control.parent.get(comparator) || undefined);
			if (!comparatorControl) {
				throw new Error('matchOtherValidator(): other control is not found in parent group');
			}
			comparatorControl.valueChanges.subscribe(() => valueControl!.updateValueAndValidity());
		}
		if (!comparatorControl.value) {
			return null;
		}
		if (comparatorControl.value == 3) {
			if (valueControl.value.indexOf('*') !== -1) {
				return null;
			}
			return { 'isLike': true };
		}
		return null;
	};
}
