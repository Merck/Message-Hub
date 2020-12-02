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
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication-service/authentication-service.service';

@Component({
	selector: 'app-forgot-password-page',
	templateUrl: './forgot-password-page.component.html',
	styleUrls: ['./forgot-password-page.component.css']
})
export class ForgotPasswordPageComponent implements OnInit {

	forgotPasswordForm: FormGroup;
	showProgress: boolean = false;
	forgotPasswordError: string = '';
	complete: boolean = false;

	constructor(private authService: AuthenticationService, private router: Router) { }

	ngOnInit() {
		this.forgotPasswordForm = new FormGroup({
			'username': new FormControl('', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)])
		});
	}

	resetPassword() {
		if (this.validateForm()) {
			this.showProgress = true;
			this.authService.forgotPassword(this.forgotPasswordForm.get('username').value)
				.subscribe((response) => {
					this.showProgress = false;

					//show some confirmation that the reset process has been initiated
					this.complete = true;
				}, (err) => {
					this.showProgress = false;
					this.forgotPasswordError = err.error.message;
				});
		}
	}

	cancel() {
		this.router.navigate(['/login']);
	}

	validateForm() {
		if (this.forgotPasswordForm.invalid) {
			this.forgotPasswordForm.get('username').markAsTouched();
			return false;
		}
		return true;
	}

	get username() { return this.forgotPasswordForm.get('username'); }
}
