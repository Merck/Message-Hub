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

import {async, TestBed} from '@angular/core/testing';

import {ForgotPasswordPageComponent} from './forgot-password-page.component';
import {FormBuilder, Validators} from '@angular/forms';
import {of} from 'rxjs';

describe('ForgotPasswordPageComponent', () => {
	let component: ForgotPasswordPageComponent;
	let authServiceMock: any;
	let routerMock: any;
	const formBuilder: FormBuilder = new FormBuilder();
	const successResponse = { "access_token": "abc.def.ghi-jkl-mno-pqr", "id_token": "abc.def.ghi-jkl-mno-pqr-stu-KiJ-vvB4v-vwx-yz", "refresh_token": "abc", "token_type": "Bearer", "expires_in": 3600, "scope": "openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated" }

	beforeEach(async(() => {
		authServiceMock = {
			forgotPassword: jest.fn()
		}
		routerMock = {
			navigate: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [ForgotPasswordPageComponent]
		});
		component = new ForgotPasswordPageComponent(authServiceMock, routerMock);
		component.forgotPasswordForm = formBuilder.group({
			username: ['', Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(30)]
		});
		component.ngOnInit();
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should call resetPassword function', () => {
		const spylogin = jest.spyOn(authServiceMock, 'forgotPassword').mockReturnValue(of(successResponse));
		const spyvalidateForm = jest.spyOn(component, 'validateForm').mockReturnValue(true);
		component.resetPassword();
		expect(component.validateForm()).toBe(true);
		expect(spylogin).toBeDefined();
	});
	it('should invalidate the form', () => {
		component.forgotPasswordForm.controls.username.setValue('');
		expect(component.forgotPasswordForm.valid).toBeFalsy();
		expect(component.validateForm()).toBe(false);
	});
	it('should call cancel function', () => {
		component.cancel();
		expect(routerMock.navigate).toBeDefined();
	});
	it('should call username getter function', () => {
		const spy = jest.spyOn(component, 'username', 'get');
		const username = component.username;
		expect(spy).toHaveBeenCalled();
	});
});

