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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { ResetConfirmResponse } from '../../models/oauth-responses';
import { MustMatch } from '../../shared/validators/must-match.validator';
import { AccountService } from '../../services/account-service/account-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'app-reset-password-page',
	templateUrl: './reset-password-page.component.html',
	styleUrls: ['./reset-password-page.component.css']
})

export class ResetPasswordPageComponent implements OnInit {

	resetPasswordForm: FormGroup = new FormGroup({});
	showProgress: boolean = false;
	checking: boolean = false;
	valid: boolean = false;
	resetComplete: boolean = false;
	resetPasswordError: string = '';
	uuid: string;
	changePass: boolean = false;
	resetError: string = "";

	constructor(private fb: FormBuilder, private _authService: AuthenticationService, private _router: Router, private _route: ActivatedRoute, private _accountService: AccountService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		if (this._router.url === '/resetpassword') {
			this.checking = false;
			this.valid = true;
			this.uuid = this._accountService.getUUID();
			this.changePass = true;
		}
		else {
			this._route.queryParams.subscribe(params => {
				var context = params['context'];
				if (context == null || context === '') {
					this.cancel();
				} else {
					this.verifyContext(context);
				}
			});
		}

		this.resetPasswordForm = this.fb.group({
			'password': ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
			'confirm_password': ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
		}, { validator: MustMatch('password', 'confirm_password') });
	}

	resetPassword() {
		if (this.validateForm()) {
			this.showProgress = true;
			//call the change_password passing in the uuid and the new password
			this._authService.changePassword(this.uuid, this.resetPasswordForm.get('password').value)
				.subscribe((response) => {
					this.resetComplete = true;
					this.showProgress = false;
				}, (err) => {
					this.resetError = this.errorHandler.handleError(err);
					this.showProgress = false;
				});
		}
	}

	cancel() {
		this._router.navigate(['/login']);
	}

	cancelHome() {
		this._router.navigate(['/home'])
	}

	returnToForgotPassword() {
		this._router.navigate(['/forgotpassword']);
	}

	validateForm() {
		if (this.resetPasswordForm.invalid) {
			this.resetPasswordForm.get('password').markAsTouched();
			this.resetPasswordForm.get('confirm_password').markAsTouched();
			return false;
		}
		return true;
	}

	verifyContext(context) {
		this.checking = true;
		this.resetError = ""
		//call the forgot_password/confirmation_result endpoint.
		this._authService.confirmPasswordReset(context)
			.subscribe((response: ResetConfirmResponse) => {
				//get the uuid from the response
				this.uuid = response.uuid;
				this.checking = false;
				this.valid = true;
			}, (err) => {
				this.resetError = this.errorHandler.handleError(err);
				this.checking = false;
				this.valid = false;
			});

	}

	get password() { return this.resetPasswordForm.get('password'); }
	get confirm_password() { return this.resetPasswordForm.get('confirm_password'); }
}
