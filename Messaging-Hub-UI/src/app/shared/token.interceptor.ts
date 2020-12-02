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
import {AuthenticationService} from '../services/authentication-service/authentication-service.service';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

	constructor(public authService: AuthenticationService  ) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		console.log( "Adding token " + this.authService.getToken());

		if (this.authService.getToken()) {
			request = this.addToken(request, this.authService.getToken());
		}

		return next.handle(request).pipe(catchError(error => {
			if (error instanceof HttpErrorResponse && error.status === 401) {
				return this.handle401Error(request, next);
			} else {
				return throwError(error);
			}
		}));
	}

	private addToken(request: HttpRequest<any>, token: string) {
		//don't add any tokens to /oauth/token endpoint
		if( request.url === "/oauth/token" ){
			return request;
		}
		return request.clone({
			setHeaders: {
				'Authorization': `Bearer ${token}`
			}
		});
	}

	private isRefreshing = false;
	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.authService.refreshToken().pipe(
				switchMap((token: any) => {
					this.isRefreshing = false;
					this.refreshTokenSubject.next(token.access_token);
					return next.handle(this.addToken(request, token.access_token));
				}));
		} else {
			return this.refreshTokenSubject.pipe(
				filter(token => token != null),
				take(1),
				switchMap(access_token => {
					return next.handle(this.addToken(request, access_token));
				}));
		}
	}
}
