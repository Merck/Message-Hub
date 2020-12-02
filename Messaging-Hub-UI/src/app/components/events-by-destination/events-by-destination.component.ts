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
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'events-by-destination',
	templateUrl: './events-by-destination.component.html',
	styleUrls: ['./events-by-destination.component.css']
})

export class EventsByDestinationComponent implements OnInit {
	chartDest: Chart;
	chartDestView: Chart;
	destinationError: string = "";
	constructor(private _metricsService: MetricsService, private errorHandler: GlobalErrorHandler, private translate: TranslateService) { }
	results;
	ngOnInit() {
		this._metricsService.getDestinationData().subscribe(data => {
			this.results = data;
			let number = this.results.map(value => value['count']);
			let destination = [];
			this.results.map(value => {
				if (value['destination_name'] == "No Route Found") {
					this.translate.get('metrics.destinations.' + value['destination_name']).subscribe(val => {
						destination.push(val)
					})
				}
				else {
					destination.push(value['destination_name'])
				}
			})
			this.chartDest = new Chart('canvasDest', {
				type: 'bar',
				data: {
					labels: destination,
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
			this.chartDestView = new Chart('canvasDestView', {
				type: 'bar',
				data: {
					labels: destination,
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
			this.translate.onLangChange.subscribe(event => {
				for (var i = 0; i <= this.chartDest.data.labels.length; i++) {
					this.chartDest.data.labels.pop();
					this.chartDestView.data.labels.pop()
				}
				this.results.map(value => {
					if (value['destination_name'] == "No Route Found") {
						this.translate.get('metrics.destinations.' + value['destination_name']).subscribe(val => {
							this.chartDest.data.labels.push(val);
						})
					}
					else {
						this.chartDest.data.labels.push(value['destination_name']);
					}
				});

				this.chartDest.update();
				this.chartDestView.update();
			});
		},
			(err) => {
				this.destinationError = this.errorHandler.handleError(err);
			})
	}

}
