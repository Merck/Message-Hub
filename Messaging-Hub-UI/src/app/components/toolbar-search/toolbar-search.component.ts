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

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
	selector: 'toolbar-search',
	templateUrl: './toolbar-search.component.html',
	styleUrls: ['./toolbar-search.component.css']
})
export class ToolbarSearchComponent implements OnInit {

	toolbarSearchForm: FormGroup;

	constructor(private _router: Router) { }

	ngOnInit() {
		this.toolbarSearchForm = new FormGroup({
        	'toolbarquerytext': new FormControl('')
        });
	}

	search(){
		let query = this.toolbarSearchForm.get('toolbarquerytext').value;
		if(query && query !== ''){
			this._router.navigate(['/search/' + query]);
		}
	}
}
