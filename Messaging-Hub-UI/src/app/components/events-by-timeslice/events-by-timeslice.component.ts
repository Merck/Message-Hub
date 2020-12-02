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
import { FormGroup, FormControl } from '@angular/forms';
import { MetricsService } from '../../services/metrics-service/metrics-service.service'
import Chart from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { GlobalErrorHandler } from '../../shared/errorHandler'

@Component({
	selector: 'events-by-timeslice',
	templateUrl: './events-by-timeslice.component.html',
	styleUrls: ['./events-by-timeslice.component.css']
})
export class EventsByTimesliceComponent implements OnInit {
	results;
	chartPrd: Chart;
	chartPrdView: Chart;
	periodError: string = "";

	constructor(private _metricsService: MetricsService, private translate: TranslateService, private errorHandler: GlobalErrorHandler) { }
	periodForm: FormGroup;

	ngOnInit() {
		this.periodForm = new FormGroup({
			'period': new FormControl('past week')
		});
		this.getData();
	}
	onPeriodChange() {
		this.getData();
	}
	getData() {
		this.periodError = "";
		this.results = [];
		this._metricsService.getPeriodData(this.periodForm.get('period').value).subscribe(data => {
			this.results = data;
			let objnumber = this.results.map(value => value['object']);
			let aggnumber = this.results.map(value => value['aggregation']);
			let trnsfnumber = this.results.map(value => value['transaction']);
			let trnxnumber = this.results.map(value => value['transformation']);
			let period;
			let xlabel;
			if (this.periodForm.get('period').value == "past week") {
				period = this.results.map(value => value['date']);
				xlabel = 'Day'
			}
			else if (this.periodForm.get('period').value == "past day") {
				period = this.results.map(value => value['hours']);
				xlabel = 'Hours';
			}
			else if (this.periodForm.get('period').value == "past hour") {
				period = this.results.map(value => value['minutes']);
				xlabel = 'Minutes';
			}
			let ylabel = 'events';
			if (this.chartPrd) {
				this.chartPrd.destroy();
			}
			if (this.chartPrdView) {
				this.chartPrdView.destroy();
			}

			this.chartPrd = new Chart('canvasPrd', {
				type: 'line',
				data: {
					labels: period,
					datasets: [{
						label: 'Object',
						data: objnumber,
						backgroundColor: '#00877c',
						borderColor: '#00877c',
						fill: false
					},
					// {
					// 	label: 'Aggregation',
					// 	data: aggnumber,
					// 	backgroundColor: '#879637',
					// 	borderColor: '#879637',
					// 	fill: false
					// },
					{
						label: 'Transaction',
						data: trnxnumber,
						backgroundColor: '#662046',
						borderColor: '#662046',
						fill: false
					},
					{
						label: 'Transformation',
						data: trnsfnumber,
						backgroundColor: '#F68D2E',
						borderColor: '#F68D2E',
						fill: false
					}]
				},
				options: {
					legend: {
						display: true,
						position: "bottom",
						labels: {
							boxWidth: 20
						}
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: xlabel
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: ylabel
							},
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
			this.chartPrdView = new Chart('canvasPrdView', {
				type: 'line',
				data: {
					labels: period,
					datasets: [{
						label: 'Object',
						data: objnumber,
						backgroundColor: '#00877c',
						borderColor: '#00877c',
						fill: false
					},
					// {
					// 	label: 'Aggregation',
					// 	data: aggnumber,
					// 	backgroundColor: '#879637',
					// 	borderColor: '#879637',
					// 	fill: false
					// },
					{
						label: 'Transaction',
						data: trnxnumber,
						backgroundColor: '#662046',
						borderColor: '#662046',
						fill: false
					},
					{
						label: 'Transformation',
						data: trnsfnumber,
						backgroundColor: '#F68D2E',
						borderColor: '#F68D2E',
						fill: false
					}]
				},
				options: {
					legend: {
						display: true,
						position: "bottom",
						labels: {
							boxWidth: 20
						}
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: xlabel
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: ylabel
							},
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
			this.chartPrd.data.datasets.forEach((dataset) => {
				this.translate.get('metrics.types.' + dataset.label).subscribe(val => {
					dataset.label = val;
				})
			});
			this.chartPrdView.data.datasets.forEach((dataset) => {
				this.translate.get('metrics.types.' + dataset.label).subscribe(val => {
					dataset.label = val;
				})
			});
			this.translate.get('metrics.periods.' + xlabel).subscribe(val => {
				this.chartPrd.options.scales.xAxes[0].scaleLabel.labelString = val;
				this.chartPrdView.options.scales.xAxes[0].scaleLabel.labelString = val;
			})
			this.translate.get('metrics.' + ylabel).subscribe(val => {
				this.chartPrd.options.scales.yAxes[0].scaleLabel.labelString = val;
				this.chartPrdView.options.scales.yAxes[0].scaleLabel.labelString = val;
			})
			this.translate.onLangChange.subscribe(event => {
				this.chartPrd.data.datasets.forEach((dataset) => {
					this.translate.get('metrics.types.' + dataset.label).subscribe(val => {
						dataset.label = val;
					})
				});
				this.chartPrdView.data.datasets.forEach((dataset) => {
					this.translate.get('metrics.types.' + dataset.label).subscribe(val => {
						dataset.label = val;
					})
				});
				this.translate.get('metrics.periods.' + xlabel).subscribe(val => {
					this.chartPrd.options.scales.xAxes[0].scaleLabel.labelString = val;
					this.chartPrdView.options.scales.xAxes[0].scaleLabel.labelString = val;
				})
				this.translate.get('metrics.' + ylabel).subscribe(val => {
					this.chartPrd.options.scales.yAxes[0].scaleLabel.labelString = val;
					this.chartPrdView.options.scales.yAxes[0].scaleLabel.labelString = val;
				})
				this.chartPrd.update();
				this.chartPrdView.update();
			});
			this.chartPrd.update();
			this.chartPrdView.update();
		},
			(err) => {
				this.periodError = this.errorHandler.handleError(err);
			})
	}
}
