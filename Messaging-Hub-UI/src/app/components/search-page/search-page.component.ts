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

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '../../services/search-service/search-service.service';
import { EventService } from '../../services/event-service/event-service.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchResults } from '../../models/search-results';
import { ActivatedRoute } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { APP_DATE_FORMATS } from 'src/app/shared/format-datepicker';
import { FileNode } from "../master-data-viewer/master-data-viewer.component";
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'app-search-page',
	templateUrl: './search-page.component.html',
	styleUrls: ['./search-page.component.css'],
	providers: [
		{ provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
	],
})

export class SearchPageComponent implements OnInit {

	private _results: SearchResults;
	private _sources: [string];
	private _destinations: [string];
	_event: any;
	private _pageSize: number = 25;
	private _sortby = [];
	_datadetails: any;

	searchForm: FormGroup;
	showProgress: boolean = false;
	searched: boolean = false;
	eventTimeSort: any = '';
	eventTypeSort: any = '';
	eventActionSort: any = '';
	sourceSort: any = '';
	destinationSort: any = '';
	statusSort: any = '';
	nestedTreeControl: NestedTreeControl<FileNode>;
	nestedDataSource: MatTreeNestedDataSource<FileNode>;
	searchError: string = "";
	viewError: string = "";
	json_data_array: any[] = [];
	showProgress1: boolean = false;
	index: any = -1;
	setEventId: any;

	constructor(private _searchService: SearchService, private _eventService: EventService,
		private _translateService: TranslateService, private _adapter: DateAdapter<Date>,
		private _route: ActivatedRoute, private errorHandler: GlobalErrorHandler) {
		this._adapter.setLocale(this.currentLanguage);
		this.nestedTreeControl = new NestedTreeControl<FileNode>(this._getChildren);
		this.nestedDataSource = new MatTreeNestedDataSource();
	}

	ngOnInit() {
		this.searchForm = new FormGroup({
			'querytext': new FormControl(''),
			'startdate': new FormControl(''),
			'enddate': new FormControl(''),
			'type': new FormControl(''),
			'action': new FormControl(''),
			'source': new FormControl(''),
			'destination': new FormControl(''),
			'status': new FormControl('')
		});

		this._route.params.subscribe(params => {
			let searchValue = params['value'];
			if (searchValue && searchValue != '') {
				this.updateText(searchValue)
			}
		});

		this._searchService.getEventSources()
			.subscribe((data: any) => {
				this._sources = data;
			}, (err) => {
				this.searchError = this.errorHandler.handleError(err);
			});

		this._searchService.getEventDestinations()
			.subscribe((data: any) => {
				this._destinations = data;
			}, (err) => {
				this.searchError = this.errorHandler.handleError(err);
			});
	}

	updateText(searchValue) {
		this.searchForm.get('querytext').setValue(searchValue);
		this.doSearch(this.searchForm, 1, this._pageSize);
	}

	search() {
		this.doSearch(this.searchForm, 1, this._pageSize);
	}

	changePage(page: number) {
		this.doSearch(this.searchForm, page, this._pageSize);
	}

	changePageSize(pageSize: number) {
		this._pageSize = pageSize;
		this.doSearch(this.searchForm, 1, pageSize);
	}

	private doSearch(filters, page: number, pageSize: number) {
		this.searchError = ""
		if (this.validateForm()) {
			this.showProgress = true;
			this.searched = false;

			this._searchService.search(filters, page, pageSize, this._sortby).subscribe((data: any) => {
				this._results = data;
				this.searched = true;
				this.showProgress = false;
			}, (err) => {
				this.searchError = this.errorHandler.handleError(err);
				this.showProgress = false;
			});
		}
	}

	getEvent(eventId: string) {
		this.viewError = ""
		this._datadetails = {}
		this._eventService.getEvent(eventId).subscribe((data: any) => {
			this._event = data;
			let eventJSON = {};
			if (this._event.json_data) {
				eventJSON = JSON.parse(this._event.json_data)
			}
			this.nestedDataSource.data = this.buildFileTree(eventJSON, 0)
		}, (err) => {
			this.viewError = this.errorHandler.handleError(err);
		});
	}


	get results() { return this._results; }
	get types() { return this._searchService.getEventTypes(); }
	get actions() { return this._searchService.getEventActions(); }
	get sources() { return this._sources; }
	get destinations() { return this._destinations }
	get statuses() { return this._searchService.getEventStatuses(); }
	get currentLanguage() { return this._translateService.currentLang; }
	get event() { return this._event; }
	get prettyJSON() {
		let json = this._event.json_data;
		if (typeof json === 'string') {
			json = JSON.parse(json);
		}
		return JSON.stringify(json, undefined, 4);
	}

	isArray(obj: any) {
		return Array.isArray(obj)
	}

	validateForm() {
		if (this.searchForm.invalid) {
			this.searchForm.get('querytext').markAsTouched();
			return false;
		}
		return true;
	}
	setSortDetails(col: any, order: any) {
		switch (col) {
			case 'eventTime':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('timestamp'));
				if (order !== '') {
					this._sortby.push({ "timestamp": { "order": order } });
				}
				this.eventTimeSort = order;
				break;
			case 'eventType':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('type'));
				if (order !== '') {
					this._sortby.push({ "type": { "order": order } });
				}
				this.eventTypeSort = order;
				break;
			case 'eventAction':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('action'));
				if (order !== '') {
					this._sortby.push({ "action": { "order": order } });
				}
				this.eventActionSort = order;
				break;
			case 'source':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('source'));
				if (order !== '') {
					this._sortby.push({ "source": { "order": order } });
				}
				this.sourceSort = order;
				break;
			case 'destination':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('destination'));
				if (order !== '') {
					this._sortby.push({ "destination": { "order": order } });
				}
				this.destinationSort = order;
				break;
			case 'status':
				this._sortby = this._sortby.filter(res => !res.hasOwnProperty('status'));
				if (order !== '') {
					this._sortby.push({ "status": { "order": order } });
				}
				this.statusSort = order;
				break;
		}
		this.search();
	}
	view(destination, eventId, index) {
		this.index = index;
		if (this.setEventId != eventId) {
			this.setEventId = eventId;
			this.json_data_array = [];
			this.showProgress1 = true;
		}
		if (!this.json_data_array[index]) {
			this.showProgress1 = true;
			this._eventService.getBCData(eventId, destination).subscribe((data: any) => {
				if (data) {
					let json = data;
					if (typeof json === 'string') {
						json = JSON.parse(json);
					}
					this.json_data_array[index] = JSON.stringify(json, undefined, 4);
				}
				else
					this.json_data_array[index] = "No data found"
				this.showProgress1 = false;
			}, (err) => {
				this.viewError = this.errorHandler.handleError(err);
				this.json_data_array[index] = "No data found"
				this.showProgress1 = false;
			});
		}
	}

	hasNestedChild = (_: number, nodeData: FileNode) => !nodeData.type;

	private _getChildren = (node: FileNode) => node.children;
	/**
	 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	 * The return value is the list of `FileNode`.
	 */
	buildFileTree(obj: { [key: string]: any }, level: number): FileNode[] {
		return Object.keys(obj).reduce<FileNode[]>((accumulator, key) => {
			const value = obj[key];
			const node = new FileNode();
			node.filename = key;

			if (value != null) {
				if (typeof value === 'object') {
					node.children = this.buildFileTree(value, level + 1);
				} else {
					node.type = value;
				}
			}

			return accumulator.concat(node);
		}, []);
	}
}
