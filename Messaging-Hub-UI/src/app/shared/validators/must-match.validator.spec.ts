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

import {MustMatch} from './must-match.validator';
import {FormControl, FormGroup} from '@angular/forms';

describe('maxTextLength', () => {
	const mustMatchValidator = MustMatch('password', 'confirm_password');

	it('should set error if password and confirm password does not match', () => {
		const control = new FormGroup({
			password: new FormControl('test12345'),
			confirm_password: new FormControl('test1234')
		});
		let errors = {};
		mustMatchValidator(control);
		errors = control.get('confirm_password').errors;
		expect(errors).toEqual({ mismatch: true });
	});

	it('should not set error if password and confirm password matches', () => {
		const control = new FormGroup({
			password: new FormControl('test12345'),
			confirm_password: new FormControl('test12345')
		});
		let errors = {};
		mustMatchValidator(control);
		errors = control.get('confirm_password').errors;
		expect(errors).toBeNull();
	});
});
