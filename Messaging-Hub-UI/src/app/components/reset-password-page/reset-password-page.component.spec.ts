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

import { ResetPasswordPageComponent } from './reset-password-page.component';
import { FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from '../../shared/validators/must-match.validator';
import { of } from 'rxjs';
import { convertToParamMap } from '@angular/router';

describe('ResetPasswordPageComponent', () => {
	let component: ResetPasswordPageComponent;
	let fbMock: any;
	let authServiceMock: any;
	let routerMock: any;
	let routeMock: any;
	let accountServiceMock: any;
	let errorHandlerMock: any;
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponse = { context: '' }
	const response = { "access_token": "abc.def.ghi-jkl-mno-pqr", "id_token": "abc.def.ghi-jkl-mno-pqr-stu-KiJ-vvB4v-vwx-yz", "refresh_token": "abc", "token_type": "Bearer", "expires_in": 3600, "scope": "openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated" }

	beforeEach(async(() => {
		fbMock = {
			group: jest.fn()
		}
		authServiceMock = {
			changePassword: jest.fn(),
			confirmPasswordReset: jest.fn()
		}
		routerMock = {
			navigate: jest.fn()
		}
		routeMock = {
			queryParams: of(convertToParamMap(successResponse))
		}
		accountServiceMock = {
			getUUID: jest.fn()
		}
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ResetPasswordPageComponent]
		});
		component = new ResetPasswordPageComponent(fbMock, authServiceMock, routerMock, routeMock, accountServiceMock, errorHandlerMock);
		component.resetPasswordForm = formBuilder.group({
			password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
			confirm_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
		}, { validator: MustMatch('password', 'confirm_password') });
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call ngOnInit with resetpassword url', () => {
		routerMock.url = '/resetpassword';
		component.ngOnInit();
		expect(component.valid).toBeTruthy();

	});
	it('should call ngOnInit', () => {
		component.ngOnInit();
		expect(routeMock.queryParams).toBeTruthy();

	});
	it('should call ngOnInit', () => {
		routeMock.queryParams = of(convertToParamMap({ context: 'aaa' }));
		component.ngOnInit();
		expect(routeMock.queryParams).toBeTruthy();
	});
	it('should call resetPassword function', () => {
		const changePassSpy = jest.spyOn(authServiceMock, 'changePassword').mockReturnValue(of(response));
		const spyvalidateForm = jest.spyOn(component, 'validateForm').mockReturnValue(true);
		component.resetPassword();
		expect(component.validateForm()).toBe(true);
		expect(authServiceMock.changePassword('a', 'b')).toBeDefined();
	});
	it('should invalidate the form', () => {
		component.resetPasswordForm.controls.confirm_password.setValue('');
		component.resetPasswordForm.controls.password.setValue('');
		expect(component.resetPasswordForm.valid).toBeFalsy();
		expect(component.validateForm()).toBe(false);
	});
	it('should validate the form', () => {
		component.resetPasswordForm.controls.confirm_password.setValue('test12345');
		component.resetPasswordForm.controls.password.setValue('test12345');
		expect(component.resetPasswordForm.valid).toBeTruthy();
		expect(component.validateForm()).toBe(true);
	});
	it('should call cancel function', () => {
		component.cancel();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call cancelHome function', () => {
		component.cancelHome();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call returnToForgotPassword function', () => {
		component.returnToForgotPassword();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call verifyContext function', () => {
		const confirmPasswordResetSpy = jest.spyOn(authServiceMock, 'confirmPasswordReset').mockReturnValue(of(response));
		component.verifyContext('aaa');
		expect(authServiceMock.confirmPasswordReset('aaa')).toBeDefined();
	});
	it('should call password getter function', () => {
		const spy = jest.spyOn(component, 'password', 'get');
		const username = component.password;
		expect(spy).toHaveBeenCalled();
	});
	it('should call confirm_password getter function', () => {
		const spy = jest.spyOn(component, 'confirm_password', 'get');
		const password = component.confirm_password;
		expect(spy).toHaveBeenCalled();
	});
});
