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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingPageComponent} from './components/landing-page/landing-page.component';
import {SearchPageComponent} from './components/search-page/search-page.component';
import {MasterDataPageComponent} from './components/master-data-page/master-data-page.component';
import {MetricsPageComponent} from './components/metrics-page/metrics-page.component';
import {RoutingRulesPageComponent} from './components/routing-rules-page/routing-rules-page.component';
import {DataPrivacyRulesPageComponent} from './components/data-privacy-rules-page/data-privacy-rules-page.component';
import {ForgotPasswordPageComponent} from './components/forgot-password-page/forgot-password-page.component';
import {ResetPasswordPageComponent} from './components/reset-password-page/reset-password-page.component';
import {ProfileInfoComponent} from './components/profile-info/profile-info.component';

import {LoginPageComponent} from './components/login-page/login-page.component';
import {AuthGuard} from './shared/auth/auth.guard.service';
import {LoginGuard} from './shared/auth/login.guard.service';
import {OrgInfoComponent} from './components/org-info/org-info.component';

const routes: Routes = [
	{ path: 'home', component: LandingPageComponent, canActivate: [AuthGuard] },
	{ path: 'search', component: SearchPageComponent, canActivate: [AuthGuard] },
	{ path: 'search/:value', component: SearchPageComponent, canActivate: [AuthGuard] },
	{ path: 'mstrdata', component: MasterDataPageComponent, canActivate: [AuthGuard] },
	{ path: 'metrics', component: MetricsPageComponent, canActivate: [AuthGuard] },
	{ path: 'routing', component: RoutingRulesPageComponent, canActivate: [AuthGuard] },
	{ path: 'privacy', component: DataPrivacyRulesPageComponent, canActivate: [AuthGuard] },
	{ path: 'profileinfo', component: ProfileInfoComponent, canActivate: [AuthGuard] },
	{ path: 'orginfo', component: OrgInfoComponent, canActivate: [AuthGuard] },
	{ path: 'login', component: LoginPageComponent, canActivate: [LoginGuard] },
	{ path: 'forgotpassword', component: ForgotPasswordPageComponent, canActivate: [LoginGuard] },
	{ path: 'resetpw', component: ResetPasswordPageComponent, canActivate: [LoginGuard] },
	{ path: 'resetpassword', component: ResetPasswordPageComponent, canActivate: [AuthGuard] },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', redirectTo: 'home' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
