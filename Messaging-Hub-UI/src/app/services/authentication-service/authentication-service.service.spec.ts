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

import {AuthenticationService} from './authentication-service.service';
import {of} from 'rxjs';

describe('AuthenticationService', () => {
	let service: AuthenticationService;
	const http = jest.fn();
	let routerMock: any;

	beforeEach(() => {
		routerMock = {
			navigate: jest.fn()
		}
		service = new AuthenticationService(http as any, routerMock);
	});

	it('should exist', () => {
		expect(service).toBeDefined();
	});
	it('should check if loggedin', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.isLoggedIn();
		expect(serviceMock.getToken()).toBeDefined();
		done();
	});
	it('should be able to login', done => {
		const httpMock = {
			post: jest.fn()
		}
		const requestBody = {
			'grant_type': 'password',
			'username': 'username',
			'password': 'password'
		};

		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.login('username', 'password');
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should save tokens catch block', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		const spy = jest.mock('jwt-decode', () => () => ({ roles: [] }))
		serviceMock.saveToken({
			access_token: 'string',
			expires_in: 1,
			id_token: "string",
			refresh_token: "string",
			scope: "string",
			token_type: "string"
		});
		expect(spy).toBeDefined();
		done();
	});
	it('should save tokens', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		const spy = jest.mock('jwt-decode', () => () => ({ amr: ["cloud_directory"], aud: ["b52ff2f8-156e-4e30-afcf-039e9d101fc5"], email_verified: true, exp: 1596095139, iat: 1596091539, iss: "https://us-south.appid.cloud.ibm.com/oauth/v4/7e4f16cd-a5b8-45a2-9d65-4096a488e9ee", roles: [], scope: "openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated", sub: "a20a8cef-b5d0-4b1c-8b63-dea45410aba9", tenant: "7e4f16cd-a5b8-45a2-9d65-4096a488e9ee" }))
		serviceMock.saveToken({
			access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcElkLTdlNGYxNmNkLWE1YjgtNDVhMi05ZDY1LTQwOTZhNDg4ZTllZS0yMDIwLTA3LTA3VDIwOjMwOjQwLjQyNCIsInZlciI6NH0.eyJpc3MiOiJodHRwczovL3VzLXNvdXRoLmFwcGlkLmNsb3VkLmlibS5jb20vb2F1dGgvdjQvN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwiZXhwIjoxNTk2MDk1NTk3LCJhdWQiOlsiYjUyZmYyZjgtMTU2ZS00ZTMwLWFmY2YtMDM5ZTlkMTAxZmM1Il0sInN1YiI6ImEyMGE4Y2VmLWI1ZDAtNGIxYy04YjYzLWRlYTQ1NDEwYWJhOSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiY2xvdWRfZGlyZWN0b3J5Il0sImlhdCI6MTU5NjA5MTk5NywidGVuYW50IjoiN2U0ZjE2Y2QtYTViOC00NWEyLTlkNjUtNDA5NmE0ODhlOWVlIiwic2NvcGUiOiJvcGVuaWQgYXBwaWRfZGVmYXVsdCBhcHBpZF9yZWFkdXNlcmF0dHIgYXBwaWRfcmVhZHByb2ZpbGUgYXBwaWRfd3JpdGV1c2VyYXR0ciBhcHBpZF9hdXRoZW50aWNhdGVkIiwicm9sZXMiOltdfQ.UIIo1FGgN-U5Ph5xHBVD6JM6Jzc7zjR_gPNWlYkrXQdZy9JPLBOlQQ7s7h8bGoCerkygQW3L-zpeJnDZtCrc2jJVSF3Bir-w4Biba_sBa-2UScN1AIZlP4s2OSUTOf-eTZ9yr8TXzwYUIdGf2Cvm2uHNy4ii9UPwK-dql4mn-kdqeJs6wKCJehBK6TKD9FhQNpOu7_rWQcwg8OkE2X0C85sTdiylZiDRk1D0YfycTJsPiMsleNrzzsHbHpX9IJm46VGHMGSUwJgvTQUttJnBaYEgyjX5FxbskWKP6-FR9W50O8nXWBcky0D9iNsDono45BD94Od5EjI4TnMUl-bOQQ",
			expires_in: 3600,
			id_token: 'aaa.bbb.ccc-ddd-eee-fff-ggg',
			refresh_token: 'aaa',
			scope: 'openid appid_default appid_readuserattr appid_readprofile appid_writeuserattr appid_authenticated',
			token_type: "Bearer"
		});
		expect(spy).toBeDefined();
		done();
	});
	it('should get roles', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.getRoles();
		expect(serviceMock.getRoles()).toBeDefined();
		done();
	});
	it('should get refresh tokens', done => {
		const httpMock = {
			get: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.getRefreshToken();
		expect(serviceMock.getRefreshToken()).toBeDefined();
		done();
	});
	it('should post refresh tokens', done => {
		const response = {
			success: true,
			tokens: "fake-tokens"
		}
		const httpMock = {
			post: jest.fn().mockReturnValue(of(response))
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.refreshToken().subscribe((data) => {
			expect(httpMock.post).toBeDefined();
			expect(httpMock.post).toHaveBeenCalled();
			expect(data).toEqual(response);
			done();
		});
	});
	it('should be able to logout', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.logout();
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should clear tokens', done => {
		const serviceMock = new AuthenticationService(http as any, routerMock);
		serviceMock.clearTokens();
		window.sessionStorage.clear();
		expect(window.sessionStorage.getItem("ACCESS_TOKEN")).toBeNull();
		expect(window.sessionStorage.getItem("REFRESH_TOKEN")).toBeNull();
		done();
	});
	it('should call forgotPassword', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.forgotPassword("user");
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should call confirmPasswordReset', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.confirmPasswordReset('aaa');
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should call changePassword', done => {
		const httpMock = {
			post: jest.fn()
		}
		const serviceMock = new AuthenticationService(httpMock as any, routerMock);
		serviceMock.changePassword(123, "123");
		expect(httpMock.post).toBeDefined();
		expect(httpMock.post).toHaveBeenCalled();
		done();
	});
	it('should call isOrgAdmin', done => {
		const spy = service.isOrgAdmin();
		expect(spy).toBe(false);
		done();
	});
	it('should call isHubAdmin', done => {
		const spy = service.isHubAdmin();
		expect(spy).toBe(false);
		done();
	});
	it('should call isOrgAdmin with empty roles', done => {
		sessionStorage.setItem("ROLES", "[]");
		const spy = service.isOrgAdmin();
		expect(spy).toBe(false);
		done();
	});

	it('should call isHubAdmin with empty roles', done => {
		sessionStorage.setItem("ROLES", "[]");
		const spy = service.isHubAdmin();
		expect(spy).toBe(false);
		done();
	});
});
