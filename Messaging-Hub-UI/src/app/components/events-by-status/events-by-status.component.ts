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
import { MetricsService } from '../../services/metrics-service/metrics-service.service';
import Chart from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { GlobalErrorHandler } from '../../shared/errorHandler'
import 'chartjs-plugin-labels';

@Component({
	selector: 'events-by-status',
	templateUrl: './events-by-status.component.html',
	styleUrls: ['./events-by-status.component.css']
})
export class EventsByStatusComponent implements OnInit {
	results;
	chartStatus: Chart;
	chartStatusView: Chart;
	statusError: string = "";

	constructor(private _metricsService: MetricsService, private translate: TranslateService, private errorHandler: GlobalErrorHandler) { }
	ngOnInit() {
		this._metricsService.getStatusData().subscribe(data => {
			this.results = data;
			let number = this.results.map(value => value['count']);
			let status = []
			this.results.map(value => this.translate.get('search.statuses.' + value['status']).subscribe(val => {
				status.push(val)
			}));
			this.chartStatus = new Chart('canvasStatus', {
				type: 'pie',
				data: {
					labels: status,
					datasets: [{
						data: number,
						backgroundColor: ['#879637', '#f68d2e', '#662046', '#d3d3d3']
					}]
				},
				options: {
					legend: {
						display: true
					},
					plugins: {
						labels: {
							render: 'value',
							fontColor: '#fff'
						}
					},
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							display: false
						}]
					}
				}
			});
			this.chartStatusView = new Chart('canvasStatusView', {
				type: 'pie',
				data: {
					labels: status,
					datasets: [{
						data: number,
						backgroundColor: ['#879637', '#f68d2e', '#662046', '#d3d3d3']
					}]
				},
				options: {
					legend: {
						display: true
					},
					plugins: {
						labels: {
							render: 'value',
							fontColor: '#fff'
						}
					},
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							display: false
						}]
					}
				}
			});
			this.translate.onLangChange.subscribe(event => {
				for (var i = 0; i <= this.chartStatus.data.labels.length; i++) {
					this.chartStatus.data.labels.pop();
					this.chartStatusView.data.labels.pop()
				}
				this.results.map(value => this.translate.get('search.statuses.' + value['status']).subscribe(val => {
					this.chartStatus.data.labels.push(val);
				}));

				this.chartStatus.update();
				this.chartStatusView.update();
			});
		},
			(err) => {
				this.statusError = this.errorHandler.handleError(err);
			})
	}

}
