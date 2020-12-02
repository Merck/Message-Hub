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
import { MasterdataService } from '../../services/masterdata-service/masterdata-service.service';
import { TranslateService } from '@ngx-translate/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { GlobalErrorHandler } from '../../shared/errorHandler'

/**
 * Json node data with nested structure. Each node has a filename and a value or a list of children
 */
export class FileNode {
	children: FileNode[];
	filename: string;
	type: any;
}

@Component({
	selector: 'master-data-viewer',
	templateUrl: './master-data-viewer.component.html',
	styleUrls: ['./master-data-viewer.component.css']
})
export class MasterDataViewerComponent implements OnInit {
	results: any;
	_datadetails: any;
	masterdata: any;
	nestedTreeControl: NestedTreeControl<FileNode>;
	nestedDataSource: MatTreeNestedDataSource<FileNode>;
	mdError: string = "";
	mdViewError: string = "";
	showProgress: boolean;
	json_data_array: any[] = [];
	showProgress1: boolean;
	index: any = -1;
	setEventId: any;

	constructor(private _masterdataService: MasterdataService, private _translateService: TranslateService, private errorHandler: GlobalErrorHandler) {
		this.nestedTreeControl = new NestedTreeControl<FileNode>(this._getChildren);
		this.nestedDataSource = new MatTreeNestedDataSource();
	}

	ngOnInit() {
		this.showProgress = true;
		this._masterdataService.getAllMasterdata().subscribe((data) => {
			console.log(data);
			this.results = data;
			this.showProgress = false;
		}, (err) => {
			this.showProgress = false;
			this.mdError = this.errorHandler.handleError(err);
		});
	}
	getData(id: string) {
		this.mdViewError = ""
		this._masterdataService.getData(id).subscribe((data: any) => {
			this._datadetails = data;
			this.masterdata = JSON.parse(this._datadetails.json_data)
			this.nestedDataSource.data = this.buildFileTree(this.masterdata, 0)
		}, (err) => {
			this.mdViewError = this.errorHandler.handleError(err);
		});
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
			this._masterdataService.getBCData(eventId, destination).subscribe((data: any) => {
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
				this.mdViewError = this.errorHandler.handleError(err);
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
	isArray(obj: any) {
		return Array.isArray(obj)
	}

	get currentLanguage() { return this._translateService.currentLang; }
	get prettyJSON() {
		let json = this._datadetails.json_data;
		if (typeof json === 'string') {
			json = JSON.parse(json);
		}
		return JSON.stringify(json, undefined, 4);
	}
}
