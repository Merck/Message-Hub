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
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication-service/authentication-service.service';
import {AccountService} from '../../services/account-service/account-service.service';
import {UserProfile} from '../../models/user-profile';

@Component({
	selector: 'toolbar-user',
	templateUrl: './toolbar-user.component.html',
	styleUrls: ['./toolbar-user.component.css']
})

export class ToolbarUserComponent implements OnInit {

	constructor(private _authService: AuthenticationService,
		private _accountService: AccountService,
		private router: Router) { }

	ngOnInit() {
		this.getUser();
		this.getOrganization();
	}

	getUser() {
		this._accountService.getUser().subscribe((data: UserProfile) => {
			this._accountService.setUUID(data.userId);

		}, (err) => {
			console.log(err);
		});
	}

	getOrganization() {
		this._accountService.getOrganization().subscribe((data: any) => {
			this._accountService.saveOrganization(data.organization_id, data.organization_name);
		}, (err) => {
			console.log("Couldn't get Organization for user. " + JSON.stringify(err));
			this.logout();
		});
	}

	logout() {
		this._authService.logout()
			.subscribe(response => {
				this._authService.clearTokens();
				this.router.navigate(['/login']);
			}, (err) => {
				console.log(err.error);
				this._authService.clearTokens();
				this.router.navigate(['/login']);
			});
	}

	profileInfo() {
		this.router.navigate(['/profileinfo']);
	}

	orgDetails() {
		this.router.navigate(['/orginfo']);
	}
	changePassword() {
		this.router.navigate(['/resetpassword']);
	}

	get userFullName() {
		try {
			return this._accountService.getUserFullName();
		} catch (e) {
			return "";
		}
	}

	get organizationName() {
		try {
			return this._accountService.getOrgName();
		} catch (e) {
			return "";
		}
	}

	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}

}
