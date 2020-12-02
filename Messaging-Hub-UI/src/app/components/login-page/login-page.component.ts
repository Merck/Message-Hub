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
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { AccountService } from '../../services/account-service/account-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OAuthTokens } from '../../models/oauth-responses';

@Component({
	selector: 'login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.css']
})

export class LoginPageComponent implements OnInit {

	loginForm: FormGroup;
	showProgress: boolean = false;
	loginError: string = '';

	constructor(private authService: AuthenticationService,
		private accountService: AccountService,
		private router: Router) {

	}

	ngOnInit() {
		this.loginForm = new FormGroup({
			'username': new FormControl('', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)]),
			'password': new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)])
		});
	}

	login() {
		if (this.validateForm()) {
			this.showProgress = true;
			this.authService.login(this.loginForm.get('username').value, this.loginForm.get('password').value)
				.subscribe((response: OAuthTokens) => {
					this.showProgress = false;
					this.authService.saveToken(response);
					this.accountService.saveUsername(this.loginForm.get('username').value);
					this.router.navigate(['/home']);
				}, (err) => {
					this.showProgress = false;
					this.loginError = err.error.message.split(':').pop();
				});
		}
	}

	forgotPassword() {
		this.router.navigate(['/forgotpassword']);
	}

	validateForm() {
		if (this.loginForm.invalid) {
			this.loginForm.get('username').markAsTouched();
			this.loginForm.get('password').markAsTouched();
			return false;
		}
		return true;
	}

	get username() { return this.loginForm.get('username'); }
	get password() { return this.loginForm.get('password'); }

}
