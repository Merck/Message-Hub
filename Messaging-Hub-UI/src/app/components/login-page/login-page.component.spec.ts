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

import { async, TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login-page.component';
import { FormBuilder, Validators } from '@angular/forms';
import { of } from 'rxjs';

describe('LoginPageComponent', () => {
	let component: LoginPageComponent;
	let authServiceMock: any;
	let routerMock: any;
	let accountServiceMock: any;
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponse = { "access_token": "abc.def.ghi-jkl-mno-pqr", "id_token": "abc.def.ghi-jkl-mno-pqr-stu-KiJ-vvB4v-vwx-yz", "refresh_token": "abc", "token_type": "Bearer", "expires_in": 3600, "scope": "openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated" }

	beforeEach(async(() => {
		routerMock = {
			navigate: jest.fn()
		}
		authServiceMock = {
			login: jest.fn(),
			saveToken: jest.fn()
		};
		accountServiceMock = {
			saveUsername: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [LoginPageComponent],
			providers: [{ provide: FormBuilder, useValue: formBuilder }]
		});
		component = new LoginPageComponent(authServiceMock, accountServiceMock, routerMock);

		// component.authService = authServiceMock;
		component.loginForm = formBuilder.group({
			username: ['', Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)],
			password: ['', Validators.required, Validators.minLength(8), Validators.maxLength(30)],
			action: ['action', Validators.required]
		});
		component.ngOnInit();
	}));


	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call login function', () => {
		const spyvalidateForm = jest.spyOn(component, 'validateForm').mockReturnValue(false);
		component.login();
		expect(component.validateForm()).toBe(false);
	});
	it('should call login function', () => {
		const spylogin = jest.spyOn(authServiceMock, 'login').mockReturnValue(of(successResponse));
		const spysaveTokens = jest.spyOn(authServiceMock, 'saveToken');
		const spyvalidateForm = jest.spyOn(component, 'validateForm').mockReturnValue(true);
		component.login();
		expect(component.validateForm()).toBe(true);
		expect(authServiceMock.login('a', 'b')).toBeDefined();
		expect(spysaveTokens).toHaveBeenCalled();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should invalidate the form', () => {
		component.loginForm.controls.username.setValue('');
		component.loginForm.controls.password.setValue('');
		expect(component.loginForm.valid).toBeFalsy();
		expect(component.validateForm()).toBe(false);
	});
	it('should call forgotPassword function', () => {
		component.forgotPassword();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call username getter function', () => {
		const spy = jest.spyOn(component, 'username', 'get');
		const username = component.username;
		expect(spy).toHaveBeenCalled();
	});
	it('should call password getter function', () => {
		const spy = jest.spyOn(component, 'password', 'get');
		const password = component.password;
		expect(spy).toHaveBeenCalled();
	});

});
