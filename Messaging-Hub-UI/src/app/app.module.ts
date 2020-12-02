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

import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SearchPageComponent } from './components/search-page/search-page.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MasterDataPageComponent } from './components/master-data-page/master-data-page.component';
import { RoutingRulesPageComponent } from './components/routing-rules-page/routing-rules-page.component';
import { MetricsPageComponent } from './components/metrics-page/metrics-page.component';
import { BaseChartDirective, ChartsModule, ThemeService } from 'ng2-charts';
import { HubStatusComponent } from './components/hub-status/hub-status.component';
import { HubAlertsComponent } from './components/hub-alerts/hub-alerts.component';
import { InputQueueStatusComponent } from './components/input-queue-status/input-queue-status.component';
import { DlQueueStatusComponent } from './components/dl-queue-status/dl-queue-status.component';
import { TotalEventsProcessedComponent } from './components/total-events-processed/total-events-processed.component';
import { EventsByTimesliceComponent } from './components/events-by-timeslice/events-by-timeslice.component';
import { EventsByTypeComponent } from './components/events-by-type/events-by-type.component';
import { EventsBySourceComponent } from './components/events-by-source/events-by-source.component';
import { EventsByDestinationComponent } from './components/events-by-destination/events-by-destination.component';
import { EventsByStatusComponent } from './components/events-by-status/events-by-status.component';
import { ToolbarSearchComponent } from './components/toolbar-search/toolbar-search.component';
import { ToolbarAlertsComponent } from './components/toolbar-alerts/toolbar-alerts.component';
import { ToolbarUserComponent } from './components/toolbar-user/toolbar-user.component';
import { MasterDataViewerComponent } from './components/master-data-viewer/master-data-viewer.component';
import { RoutingRulesViewerComponent } from './components/routing-rules-viewer/routing-rules-viewer.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { DataPrivacyRulesPageComponent } from './components/data-privacy-rules-page/data-privacy-rules-page.component';
import { DataPrivacyRulesViewerComponent } from './components/data-privacy-rules-viewer/data-privacy-rules-viewer.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { ForgotPasswordPageComponent } from './components/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './components/reset-password-page/reset-password-page.component';

import { AuthGuard } from './shared/auth/auth.guard.service';
import { LoginGuard } from './shared/auth/login.guard.service';
import { AuthenticationService } from './services/authentication-service/authentication-service.service';
import { TokenInterceptor } from './shared/token.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalErrorHandler } from './shared/errorHandler';
import { AlertService } from './services/alert-service/alert-service.service'

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { AppDateAdapter } from './shared/format-datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { OrgInfoComponent } from './components/org-info/org-info.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { ScrollingModule } from '@angular/cdk/scrolling'

@NgModule({
	declarations: [
		AppComponent,
		SearchPageComponent,
		LandingPageComponent,
		MasterDataPageComponent,
		MetricsPageComponent,
		HubStatusComponent,
		HubAlertsComponent,
		InputQueueStatusComponent,
		DlQueueStatusComponent,
		TotalEventsProcessedComponent,
		EventsByTimesliceComponent,
		EventsByTypeComponent,
		EventsBySourceComponent,
		EventsByDestinationComponent,
		EventsByStatusComponent,
		ToolbarSearchComponent,
		RoutingRulesPageComponent,
		ToolbarAlertsComponent,
		ToolbarUserComponent,
		MasterDataViewerComponent,
		RoutingRulesViewerComponent,
		LoginPageComponent,
		DataPrivacyRulesPageComponent,
		DataPrivacyRulesViewerComponent,
		LanguageSelectorComponent,
		ForgotPasswordPageComponent,
		ResetPasswordPageComponent,
		ProfileInfoComponent,
		OrgInfoComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		ChartsModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		BrowserAnimationsModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		MatNativeDateModule,
		FlexLayoutModule,
		DragDropModule,
		NgMultiSelectDropDownModule.forRoot(),
		MatTreeModule, MatIconModule
	],
	exports: [
		CdkTableModule,
		CdkTreeModule,
		MatTreeModule,
		ScrollingModule
	],
	providers: [AuthGuard, LoginGuard, AuthenticationService, BaseChartDirective, ThemeService, GlobalErrorHandler, AlertService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		MatDatepickerModule,
		MatNativeDateModule,
		{ provide: DateAdapter, useClass: AppDateAdapter },
		{ provide: LOCALE_ID, useValue: 'de-DE' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http);
}
