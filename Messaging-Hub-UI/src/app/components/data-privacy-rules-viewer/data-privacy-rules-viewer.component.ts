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
import { AuthenticationService } from '../../services/authentication-service/authentication-service.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrivacyService } from '../../services/privacy-service/privacy-service.service';
import { AccountService } from '../../services/account-service/account-service.service';
import { GlobalErrorHandler } from '../../shared/errorHandler'

declare var $: any;

@Component({
	selector: 'data-privacy-rules-viewer',
	templateUrl: './data-privacy-rules-viewer.component.html',
	styleUrls: ['./data-privacy-rules-viewer.component.css']
})
export class DataPrivacyRulesViewerComponent implements OnInit {
	@ViewChild('closebutton1', { static: false }) closebutton1;
	@ViewChild('closebutton2', { static: false }) closebutton2;

	dataElements: any;
	privacySettings: any;
	results: any;
	add: boolean;
	edit: boolean;
	delete: boolean;
	rulesForm: FormGroup;

	deleteID: any;
	editID: any;
	editOrder: any;
	reorder: boolean;
	showProgress: boolean;
	dataElementsCopy: any;
	eventTypes: any;
	mainError: string = "";
	AddEditError: string = "";
	DeleteReorderError: string = "";
	showProgress1: boolean;
	constructor(private _authService: AuthenticationService,
		private _privacyService: PrivacyService, private _accountService: AccountService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		this.rulesForm = new FormGroup({
			'eventType': new FormControl('', [Validators.required]),
			'dataElement': new FormControl('', [Validators.required]),
			'privacySettings': new FormControl(false)
		});

		this._privacyService.getDataElement().subscribe((data: any) => {
			this.eventTypes = [...new Set(data.map(item => item.data_type))];
			this.dataElementsCopy = data;
		}, (err) => {
			this.mainError = this.errorHandler.handleError(err);
		});

		this.getPrivacyRules();
	}

	getPrivacyRules() {
		this.mainError = "";
		this.showProgress1 = true;
		this._privacyService.getAllPrivacyRules().subscribe((data) => {
			this.results = data;
			this.showProgress1 = false;

		}, (err) => {
			this.results = [];
			this.mainError = this.errorHandler.handleError(err);
			this.showProgress1 = false;
		});
	}

	addRR() {
		this.showProgress = true;
		this.AddEditError = "";
		//the new rule should always be first in the list when it is created, so give it order -1
		this._privacyService.addPrivacyRule(this.rulesForm, -1,
			this._accountService.getUsername()).subscribe((data) => {
				this.getPrivacyRules();
				this.rulesForm.reset();
				this.closebutton1.nativeElement.click();
				this.closebutton2.nativeElement.click();
				this.showProgress = false;
			}, (err) => {
				this.AddEditError = this.errorHandler.handleError(err);
				this.closebutton2.nativeElement.click();
				this.showProgress = false;
			});

	}
	editRR() {
		this.showProgress = true;
		this.AddEditError = "";
		this._privacyService.editPrivacyRule(this.rulesForm, this.editOrder,
			this._accountService.getUsername(), this.editID).subscribe((data) => {
				this.getPrivacyRules();
				this.rulesForm.reset();
				this.closebutton1.nativeElement.click();
				this.closebutton2.nativeElement.click();
				this.showProgress = false;
			}, (err) => {
				this.AddEditError = this.errorHandler.handleError(err);
				this.closebutton2.nativeElement.click();
				this.showProgress = false;
			});

	}
	deleteRR() {
		this.DeleteReorderError = "";
		this.showProgress = true;
		this._privacyService.deletePrivacyRule(this.deleteID, this._accountService.getUsername()).subscribe((data) => {
			this.getPrivacyRules();
			this.closebutton2.nativeElement.click();
			this.showProgress = false;
		}, (err) => {
			this.DeleteReorderError = this.errorHandler.handleError(err);
			this.showProgress = false;
		});
	}
	reorderRR() {
		this.DeleteReorderError = "";
		this.showProgress = true;
		var idArray = this.results.map(function (el) { return el.id; });
		this._privacyService.reorderPrivacyRule(idArray, this._accountService.getUsername()).subscribe((data) => {
			this.getPrivacyRules();
			this.closebutton2.nativeElement.click();
			this.showProgress = false;
		}, (err) => {
			this.DeleteReorderError = this.errorHandler.handleError(err);
			this.showProgress = false;
		});
	}

	drop(event: CdkDragDrop<string[]>) {
		this.DeleteReorderError = ""
		this.reorder = true;
		this.edit = false;
		this.add = false;
		this.delete = false;
		moveItemInArray(this.results, event.previousIndex, event.currentIndex);
		$('#confirmModalCenter').modal('show');

	}
	selected(id) {
		this.rulesForm.reset();
		if (this.edit) {
			this.AddEditError = "";
			this.editID = id
			this._privacyService.getPrivacyRule(id).subscribe((data) => {
				this.editOrder = data['order']
				this.rulesForm.get('eventType').setValue(data['datafield_type']);
				this.dataElements = this.dataElementsCopy.filter(res => (res.data_type).includes(data['datafield_type']));
				var datafield = this.dataElements.find(val => val.id === data['data_field']);

				this.rulesForm.patchValue({
					dataElement: datafield.id,
					privacySettings: data['can_store']
				});
			}, (err) => {
				this.AddEditError = this.errorHandler.handleError(err);
			});

		}
		else if (this.delete) {
			this.DeleteReorderError = ""
			this.deleteID = id;
		}
	}

	validateForm() {
		if (this.rulesForm.invalid) {
			this.rulesForm.get('eventType').markAsTouched();
			this.rulesForm.get('dataElement').markAsTouched();
		}
		else {
			$('#confirmModalCenter').modal('show');
		}
	}
	cancel() {
		this.rulesForm.reset();
	}
	cancelReorder() {
		this.getPrivacyRules();
		this.closebutton2.nativeElement.click();

	}
	onEventTypeChange(event) {
		this.rulesForm.controls['dataElement'].reset();
		this.dataElements = this.dataElementsCopy.filter(res => (res.data_type).toLowerCase().includes(event.target.value.toLowerCase()));
	}
	resetData() {
		this.dataElements = []
	}
	privacySetting(val: boolean) {
		if (val) {
			return "store"
		}
		else {
			return "doNotStore"
		}
	}
	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}
}
