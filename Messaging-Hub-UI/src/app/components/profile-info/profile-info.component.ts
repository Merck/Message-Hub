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

import { Component, OnInit, ViewChild } from '@angular/core';
import { UserProfile } from '../../models/user-profile';
import { AccountService } from '../../services/account-service/account-service.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication-service/authentication-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalErrorHandler } from '../../shared/errorHandler'

declare var $: any;

@Component({
	selector: 'app-profile-info',
	templateUrl: './profile-info.component.html',
	styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent implements OnInit {
	@ViewChild('closebutton', { static: false }) closebutton;
	isEditEmailEnable: boolean;
	isEditFirstNameEnable: boolean;
	isEditLastNameEnable: boolean;
	profileForm: FormGroup;
	error: any;
	showProgress: boolean;
	profileError: string = "";
	emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+[\.]+[a-z]{2,4}$";
	constructor(private _authService: AuthenticationService, private _accountService: AccountService, private router: Router, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		this.profileForm = new FormGroup({
			'firstName': new FormControl('', [Validators.required]),
			'lastName': new FormControl('', [Validators.required]),
			'email': new FormControl('', [Validators.required,
			Validators.minLength(8), Validators.maxLength(30)])
		});
		this.getUser();
	}

	onFirstNameEdit() {
		this.isEditFirstNameEnable = true;
	}
	onLastNameEdit() {
		this.isEditLastNameEnable = true;
	}
	onEmailEdit() {
		this.isEditEmailEnable = true;
	}
	onSave() {
		this.profileError = ""
		this.showProgress = true;
		this._accountService.editUser(this.profileForm).subscribe((data) => {
			// you have to log out and back in to see the results of any profile edits
			// because App ID won't show them until a new access token is created.
			this.closebutton.nativeElement.click();
			console.log("Sorry. I must log you out now.");
			this._authService.clearTokens();
			this.showProgress = false;
			this.router.navigate(['/login']);
		}, (err) => {
			this.closebutton.nativeElement.click();
			this.profileError = this.errorHandler.handleError(err);
			this.showProgress = false;
		});
	}
	onCancel() {
		this.getUser();
		this.error = "";
	}

	getUser() {
		this.profileError = ''
		this._accountService.getUser().subscribe((data: UserProfile) => {
			this.profileForm.patchValue({
				firstName: data.givenName,
				lastName: data.familyName,
				email: data.username
			});
			this.isEditFirstNameEnable = false;
			this.isEditLastNameEnable = false;
			this.isEditEmailEnable = false;
		}, (err) => {
			this.profileError = this.errorHandler.handleError(err);
			this.isEditFirstNameEnable = false;
			this.isEditLastNameEnable = false;
			this.isEditEmailEnable = false;
		});
	}
	home() {
		this.router.navigate(['/home']);
	}
	validateForm() {
		this.profileError = ""
		this.error = "";
		if (this.profileForm.invalid) {
			this.profileForm.get('firstName').markAsTouched();
			this.profileForm.get('lastName').markAsTouched();
			this.profileForm.get('email').markAsTouched();
		}
		else {
			$('#confirmModalCenter').modal('show');
		}
	}
	get firstName() { return this.profileForm.get('firstName'); }
	get lastName() { return this.profileForm.get('lastName'); }
	get email() { return this.profileForm.get('email'); }
	get roles() {
		try {
			return this._authService.getRoles();
		} catch (e) {
			return [];
		}
	}

}
