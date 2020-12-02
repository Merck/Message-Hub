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
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { RoutingService } from '../../services/routing-service/routing-service.service';
import { AccountService } from '../../services/account-service/account-service.service';
import { MustContain } from '../../shared/validators/must-contain.validator';
import { GlobalErrorHandler } from '../../shared/errorHandler'

declare var $: any;

@Component({
	selector: 'routing-rules-viewer',
	templateUrl: './routing-rules-viewer.component.html',
	styleUrls: ['./routing-rules-viewer.component.css']
})

export class RoutingRulesViewerComponent implements OnInit {
	@ViewChild('closebutton1', { static: false }) closebutton1;
	@ViewChild('closebutton2', { static: false }) closebutton2;
	dataElements: any;
	comparators: any;
	results: any;
	add: boolean;
	edit: boolean;
	delete: boolean;
	rulesForm: FormGroup;

	destinations: any;
	selectedDestinationItems;
	dropdownSettings: IDropdownSettings = {};
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

	constructor(private _authService: AuthenticationService, private _routingService: RoutingService, private _accountService: AccountService, private errorHandler: GlobalErrorHandler) { }

	ngOnInit() {
		this.rulesForm = new FormGroup({
			'eventType': new FormControl('', [Validators.required]),
			'dataElement': new FormControl('', [Validators.required]),
			'comparator': new FormControl('', [Validators.required]),
			'value': new FormControl('', [Validators.required, MustContain('comparator')]),
			'destination': new FormControl('', [Validators.required])
		});
		this.dropdownSettings = {
			singleSelection: false,
			selectAllText: 'All',
			unSelectAllText: 'UnSelect All',
			textField: "display_name",
			idField: 'service_name'
		};
		this._routingService.getDataElement().subscribe((data: any) => {
			this.eventTypes = [...new Set(data.map(item => item.data_type))];
			this.dataElementsCopy = data;
		}, (err) => {
			this.mainError = this.errorHandler.handleError(err);
		});

		this._routingService.getComparator().subscribe((data: any) => {
			this.comparators = data;
		}, (err) => {
			this.mainError = this.errorHandler.handleError(err);
		});

		this._routingService.getDestination().subscribe((data: any) => {
			this.destinations = data;
		}, (err) => {
			this.mainError = this.errorHandler.handleError(err);
		});

		this.getRoutingRules();
	}

	getRoutingRules() {
		this.mainError = "";
		this.showProgress1 = true;
		this._routingService.getAllRoutingRules().subscribe((data) => {
			this.results = data;
			this.showProgress1 = false;

		}, (err) => {
			this.results = [];
			this.showProgress1 = false;
			this.mainError = this.errorHandler.handleError(err);
		});
	}

	addRR() {
		this.AddEditError = "";
		this.showProgress = true;
		//the new rule should always be first in the list when it is created, so give it order -1
		this._routingService.addRoutingRule(this.rulesForm, -1, this._accountService.getUsername()).subscribe((data) => {
			this.getRoutingRules();
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
		this.AddEditError = "";
		this.showProgress = true;
		this._routingService.editRoutingRule(this.rulesForm, this.editOrder, this._accountService.getUsername(), this.editID).subscribe((data) => {
			this.getRoutingRules();
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
		this._routingService.deleteRoutingRule(this.deleteID, this._accountService.getUsername()).subscribe((data) => {
			this.getRoutingRules();
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
		this._routingService.reorderRoutingRule(idArray, this._accountService.getUsername()).subscribe((data) => {
			this.getRoutingRules();
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
		this.AddEditError = "";
		this.DeleteReorderError = "";
		this.rulesForm.reset();
		if (this.edit) {
			this.editID = id
			this._routingService.getRoutingRule(id).subscribe((data) => {
				this.editOrder = data['order'];
				this.rulesForm.get('eventType').setValue(data['datafield_type']);
				this.dataElements = this.dataElementsCopy.filter(res => (res.data_type).includes(data['datafield_type']));
				var datafield = this.dataElementsCopy.find(val => val.id === data['data_field']);
				var comp = this.comparators.find(val => val.id === data['comparator']);
				this.selectedDestinationItems = [];
				data['destinations'].forEach(element => {
					var temp;
					temp = this.destinations.find(val => val.service_name === element);
					this.selectedDestinationItems.push(temp)
				});
				this.rulesForm.patchValue({
					dataElement: datafield.id,
					comparator: comp.id,
					value: data['value']
				});
			}, (err) => {
				this.AddEditError = this.errorHandler.handleError(err);
			});

		}
		else if (this.delete) {
			this.deleteID = id;
		}
	}

	validateForm() {
		if (this.rulesForm.invalid || this.rulesForm.get('value').hasError('isLike')) {
			this.rulesForm.get('eventType').markAsTouched();
			this.rulesForm.get('dataElement').markAsTouched();
			this.rulesForm.get('comparator').markAsTouched();
			this.rulesForm.get('value').markAsTouched();
			this.rulesForm.get('destination').markAsTouched();
		}
		else {
			$('#confirmModalCenter').modal('show');
		}
	}
	cancel() {
		this.rulesForm.reset();
	}
	cancelReorder() {
		this.getRoutingRules();
		this.closebutton2.nativeElement.click();

	}
	mapdest(val: any) {
		var dest = this.destinations.find(element => element.service_name === val);
		if (dest && dest.display_name) {
			return dest.display_name;
		}
		else {
			return val;
		}
	}
	onEventTypeChange(event) {
		this.rulesForm.controls['dataElement'].reset();
		this.dataElements = this.dataElementsCopy.filter(res => (res.data_type).includes(event.target.value));
	}
	resetData() {
		this.dataElements = []
	}
	get isOrgAdmin() {
		return this._authService.isOrgAdmin();
	}
}

