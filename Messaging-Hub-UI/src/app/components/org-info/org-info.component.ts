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
import { AccountService } from '../../services/account-service/account-service.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

declare var $: any;

@Component({
	selector: 'app-org-info',
	templateUrl: './org-info.component.html',
	styleUrls: ['./org-info.component.css']
})
export class OrgInfoComponent implements OnInit {
	@ViewChild('closebutton1', { static: false }) closebutton1;
	@ViewChild('closebutton2', { static: false }) closebutton2;
	@ViewChild('closebutton3', { static: false }) closebutton3;
	@ViewChild('closebutton4', { static: false }) closebutton4;
	isEditOrgEnable: boolean;
	results;
	orgForm: FormGroup;
	add: boolean;
	edit: boolean;
	delete: boolean;
	userEditForm: FormGroup;
	userAddForm: FormGroup;
	deleteID: any;
	editID: any;

	editError: boolean;
	showProgress: boolean;
	error: any;
	selfChange: boolean = false;
	emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+[\.]+[a-z]{2,4}$";
	OrgError: string = "";
	getUserError: string = "";
	editUserError: string = "";
	addUserError: string = "";
	deleteUserError: string = "";

	constructor(private _accountService: AccountService, private router: Router, private _authService: AuthenticationService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		this.orgForm = new FormGroup({
			'org': new FormControl('', [Validators.required])
		});
		this.userAddForm = new FormGroup({
			'user': new FormControl('', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)]),
			'password': new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
			'firstname': new FormControl('', [Validators.required]),
			'lastname': new FormControl('', [Validators.required]),
			'role': new FormControl(false)
		});
		this.userEditForm = new FormGroup({
			'user': new FormControl('', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)]),
			'firstname': new FormControl('', [Validators.required]),
			'lastname': new FormControl('', [Validators.required]),
			'role': new FormControl(false)
		});
		this.getOrg();
		this.getUsers();
	}
	getOrg() {
		this.OrgError = ""
		this._accountService.getOrganization().subscribe((data) => {
			this.orgForm.patchValue({
				org: data['organization_name']
			});
			this._accountService.saveOrganization(data['organization_id'], data['organization_name']);
			this.isEditOrgEnable = false;
		}, (err) => {
			this.OrgError = this.errorHandler.handleError(err);
			this.isEditOrgEnable = false;
		});
	}
	getUsers() {
		this.getUserError = ""
		this._accountService.getUsers().subscribe((data) => {
			this.results = data;
		}, (err) => {
			this.getUserError = this.errorHandler.handleError(err);
		});
	}
	onOrgEdit() {
		this.isEditOrgEnable = true;
	}
	onOrgSave() {
		this.showProgress = true;
		this.OrgError = ""
		this._accountService.editOrganization(this.orgForm).subscribe((data) => {
			this.getOrg();
			this.showProgress = false;
			this.closebutton4.nativeElement.click();
		}, (err) => {
			this.showProgress = false;
			this.OrgError = this.errorHandler.handleError(err);
		});
	}
	onCancel() {
		this.error = "";
		this.getOrg();
	}
	home() {
		this.router.navigate(['/home']);
	}
	selected(event) {
		this.selfChange = false;
		this.editError = false;
		this.error = "";
		this.userEditForm.reset();
		this.editUserError = "";
		this.deleteUserError = "";
		if (event.username == this._accountService.getUsername()) {
			this.selfChange = true;
		}
		if (this.edit) {
			this.editUserError = ""
			this._accountService.getOrganizationUser(event.username).subscribe((data: any) => {
				this.userEditForm.controls['user'].setValue(data.username);
				this.userEditForm.controls['firstname'].setValue(data.givenName);
				this.userEditForm.controls['lastname'].setValue(data.familyName);


				let isAdmin = false;
				if (data.roles) {
					for (var i = 0; i < data.roles.length; i++) {
						if ('organization_admin' === data.roles[i].name) {
							isAdmin = true;
						}
					}
				}
				this.userEditForm.controls['role'].setValue(isAdmin);
				this.editID = event.username;
			}, (err) => {
				this.editUserError = this.errorHandler.handleError(err);
			});
		}
		else if (this.delete) {
			this.deleteUserError = ""
			this.deleteID = event.username;
		}
	}
	validateForm() {
		if (this.orgForm.invalid) {
			this.orgForm.get('org').markAsTouched();
		}
		else {
			$('#confirmModalCenterOrg').modal('show');
		}
	}
	validateAddEdit() {
		if (this.add) {
			if (this.userAddForm.invalid) {
				this.userAddForm.get('user').markAsTouched();
				this.userAddForm.get('password').markAsTouched();
				this.userAddForm.get('firstname').markAsTouched();
				this.userAddForm.get('lastname').markAsTouched();
			}
			else {
				$('#confirmModalCenter').modal('show');
			}
		}
		else if (this.edit) {
			if (this.userEditForm.touched) {
				if (this.userEditForm.get('user').touched) {
					if (!this.userEditForm.get('user').hasError('pattern')) {
						$('#confirmModalCenter').modal('show');
					}
				}
				else {
					$('#confirmModalCenter').modal('show');
				}
			}
			else {
				this.editError = true;
			}
		}
	}
	onAdd() {
		this.addUserError = ""
		this.showProgress = true;
		this._accountService.addUserOrg(this.userAddForm).subscribe((data) => {
			this.getUsers();
			this.userAddForm.reset();
			this.closebutton1.nativeElement.click();
			this.closebutton3.nativeElement.click();
			this.showProgress = false;
		}, (err) => {
			this.addUserError = this.errorHandler.handleError(err);
			this.showProgress = false;
			this.closebutton3.nativeElement.click();
		});
	}
	onEdit() {
		this.editUserError = ""
		this.showProgress = true;
		this._accountService.editUserOrg(this.userEditForm, this.editID).subscribe((data) => {
			if (this.selfChange) {
				// you have to log out and back in to see the results of any profile edits
				// because App ID won't show them until a new access token is created.
				this.closebutton2.nativeElement.click();
				this.closebutton3.nativeElement.click();
				console.log("Sorry. I must log you out now.");
				this._authService.clearTokens();
				this.showProgress = false;
				this.router.navigate(['/login']);
			}
			else {
				this.getUsers();
				this.userEditForm.reset();
				this.closebutton2.nativeElement.click();
				this.closebutton3.nativeElement.click();
				this.showProgress = false;
			}
		}, (err) => {
			this.editUserError = this.errorHandler.handleError(err);
			this.showProgress = false;
			this.closebutton3.nativeElement.click();
			this.selfChange = false;
		});
	}
	onDelete() {
		this.deleteUserError = ""
		this.showProgress = true;
		this._accountService.deleteUserOrg(this.deleteID).subscribe((data) => {
			if (this.selfChange) {
				// you have to log out and back in to see the results of any profile edits
				// because App ID won't show them until a new access token is created.
				this.closebutton3.nativeElement.click();
				console.log("Sorry. I must log you out now.");
				this._authService.clearTokens();
				this.showProgress = false;
				this.router.navigate(['/login']);
			}
			else {
				this.getUsers();
				this.closebutton3.nativeElement.click();
				this.showProgress = false;
			}
		}, (err) => {
			this.showProgress = false;
			this.deleteUserError = this.errorHandler.handleError(err);
			this.selfChange = false;
		});
	}
	get org() { return this.orgForm.get('org'); }
	get user() { return this.userAddForm.get('user'); }
	get password() { return this.userAddForm.get('password'); }
	get firstname() { return this.userAddForm.get('firstname'); }
	get lastname() { return this.userAddForm.get('lastname'); }
	get role() { return this.userAddForm.get('role'); }
	get userEdit() { return this.userEditForm.get('user'); }
	get firstnameEdit() { return this.userEditForm.get('firstname'); }
	get lastnameEdit() { return this.userEditForm.get('lastname'); }
	get roleEdit() { return this.userEditForm.get('role'); }

}
