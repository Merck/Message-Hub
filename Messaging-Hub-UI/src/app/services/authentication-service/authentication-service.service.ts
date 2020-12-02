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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import JwtDecode from 'jwt-decode';
import {OAuthTokens} from '../../models/oauth-responses';
import {Router} from "@angular/router";

@Injectable({
	providedIn: 'root'
})

export class AuthenticationService {

	private readonly ACCESS_TOKEN = 'ACCESS_TOKEN';
	private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
	private readonly ROLES = 'ROLES';


	constructor(private _httpClient: HttpClient, private router: Router) {
	}

	isLoggedIn() {
		return !!this.getToken();
	}

	login(username: string, password: string) {

		let requestBody = {
			'grant_type': 'password',
			'username': username,
			'password': password
		};

		return this._httpClient.post('/oauth/token', requestBody);
	}



	saveToken(tokens: OAuthTokens) {
		sessionStorage.setItem(this.ACCESS_TOKEN, tokens.access_token);
		sessionStorage.setItem(this.REFRESH_TOKEN, tokens.refresh_token);
		this.saveRoles(tokens.access_token)
	}

	saveRoles(access_token) {
		try {
			let decoded = JwtDecode(access_token);
			sessionStorage.setItem(this.ROLES, JSON.stringify(decoded.roles));
		} catch (err) {
			console.log(err);
		}
	}

	getRoles() {
		return JSON.parse(sessionStorage.getItem(this.ROLES));
	}

	getToken() {
		return sessionStorage.getItem(this.ACCESS_TOKEN);
	}

	getRefreshToken() {
		return sessionStorage.getItem(this.REFRESH_TOKEN);
	}

	refreshToken() {
		let requestBody = {
			'grant_type': 'refresh_token',
			'refresh_token': this.getRefreshToken()
		};

		console.log("attempting to refresh the access token");

		return this._httpClient.post<any>('/oauth/token', requestBody)
			.pipe(
				tap(
					(tokens: any) => {
						this.saveToken(tokens);
					},
					(err: any) => {
						console.log("Sorry. I must log you out now.");
						this.clearTokens();
						this.router.navigate(['/login']);
					}
				)
			);
	}

	logout() {
		let requestBody = {
			'refresh_token': this.getRefreshToken()
		};

		return this._httpClient.post('/oauth/revoke', requestBody);
	}

	clearTokens() {
		sessionStorage.clear();
	}

	forgotPassword(username) {
		let requestBody = {
			'username': username
		};

		return this._httpClient.post('/oauth/forgotpassword', requestBody);
	}

	confirmPasswordReset(context) {
		let requestBody = {
			'context': context
		};

		return this._httpClient.post('/oauth/forgotpassword/confirm', requestBody);
	}

	changePassword(uuid, password) {
		let requestBody = {
			'uuid': uuid,
			'password': password
		};

		return this._httpClient.post('/oauth/changepassword', requestBody);
	}

	isOrgAdmin() {
		let roles = this.getRoles();
		if (!roles) {
			return false;
		}
		for (var i = 0; i < roles.length; i++) {
			if ('organization_admin' === roles[i]) {
				return true;
			}
		}
		return false;
	}

	isHubAdmin() {
		let roles = this.getRoles();
		if (!roles) {
			return false;
		}
		for (var i = 0; i < roles.length; i++) {
			if ('hub_admin' === roles[i]) {
				return true;
			}
		}
		return false;
	}
}
