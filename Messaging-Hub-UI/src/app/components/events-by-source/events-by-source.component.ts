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
import { MetricsService } from '../../services/metrics-service/metrics-service.service'
import Chart from 'chart.js';
import { GlobalErrorHandler } from '../../shared/errorHandler';
import 'chartjs-plugin-labels';

@Component({
	selector: 'events-by-source',
	templateUrl: './events-by-source.component.html',
	styleUrls: ['./events-by-source.component.css']
})
export class EventsBySourceComponent implements OnInit {
	results;
	chartSrc: Chart;
	chartSrcView: Chart;
	sourceError: string = "";

	constructor(private _metricsService: MetricsService, private errorHandler: GlobalErrorHandler) { }
	ngOnInit() {
		this._metricsService.getSourceData().subscribe(data => {
			this.results = data;
			let number = this.results.map(value => value['count']);
			let source = this.results.map(value => value['source']);
			this.chartSrc = new Chart('canvasSrc', {
				type: 'bar',
				data: {
					labels: source,
					datasets: [{
						data: number,
						backgroundColor: '#00877c'
					}]
				},
				options: {
					legend: {
						display: false
					},
					plugins: {
						labels: {
							render: 'value',
							position: 'outside',
							// textMargin: -3
							fontColor: '#fff'
						}
					},
					scales: {
						xAxes: [{
							display: true
						}],
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero: true,
								callback: function (value) {
									if (Number(value) % 1 === 0) { return value; }
								},
							}
						}]
					}
				}
			});
			this.chartSrcView = new Chart('canvasSrcView', {
				type: 'bar',
				data: {
					labels: source,
					datasets: [{
						data: number,
						backgroundColor: '#00877c'
					}]
				},
				options: {
					legend: {
						display: false
					},
					plugins: {
						labels: {
							render: 'value',
							position: 'outside',
							// textMargin: -3
							fontColor: '#fff'
						}
					},
					scales: {
						xAxes: [{
							display: true
						}],
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero: true,
								callback: function (value) {
									if (Number(value) % 1 === 0) { return value; }
								},
							}
						}]
					}
				}
			});
		},
			(err) => {
				this.sourceError = this.errorHandler.handleError(err);
			})
	}

}
