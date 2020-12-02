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
import { TranslateService } from '@ngx-translate/core';
import { GlobalErrorHandler } from '../../shared/errorHandler';
import 'chartjs-plugin-labels';

@Component({
	selector: 'events-by-type',
	templateUrl: './events-by-type.component.html',
	styleUrls: ['./events-by-type.component.css']
})
export class EventsByTypeComponent implements OnInit {
	results;
	chartTyp: Chart;
	chartTypView: Chart;
	typeError: string = "";

	constructor(private _metricsService: MetricsService, private translate: TranslateService, private errorHandler: GlobalErrorHandler) { }
	ngOnInit() {
		this._metricsService.getTypeData().subscribe(data => {
			this.results = data;
			let number = this.results.map(value => value['count']);
			let type = []
			this.results.map(value => this.translate.get('search.types.' + value['type']).subscribe(val => {
				type.push(val)
			}));
			let xlabel = 'typ'
			let ylabel = 'events'

			this.chartTyp = new Chart('canvasTyp', {
				type: 'bar',
				data: {
					labels: type,
					datasets: [{
						data: number,
						backgroundColor: ['#00877c', '#879637', '#662046', '#F68D2E']
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
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Type'
							},
							gridLines: {
								display: false
							},
							stacked: true
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Events'
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
			this.chartTypView = new Chart('canvasTypView', {
				type: 'bar',
				data: {
					labels: type,
					datasets: [{
						data: number,
						backgroundColor: ['#00877c', '#879637', '#662046', '#F68D2E']
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
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Type'
							},
							gridLines: {
								display: false
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Events'
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
			this.translate.get('metrics.' + xlabel).subscribe(val => {
				this.chartTyp.options.scales.xAxes[0].scaleLabel.labelString = val;
				this.chartTypView.options.scales.xAxes[0].scaleLabel.labelString = val;
			})
			this.translate.get('metrics.' + ylabel).subscribe(val => {
				this.chartTyp.options.scales.yAxes[0].scaleLabel.labelString = val;
				this.chartTypView.options.scales.yAxes[0].scaleLabel.labelString = val;
			})
			this.translate.onLangChange.subscribe(event => {
				this.translate.get('metrics.' + xlabel).subscribe(val => {
					this.chartTyp.options.scales.xAxes[0].scaleLabel.labelString = val;
					this.chartTypView.options.scales.xAxes[0].scaleLabel.labelString = val;
				})
				this.translate.get('metrics.' + ylabel).subscribe(val => {
					this.chartTyp.options.scales.yAxes[0].scaleLabel.labelString = val;
					this.chartTypView.options.scales.yAxes[0].scaleLabel.labelString = val;
				})

				this.chartTyp.update();
				this.chartTypView.update();
			});
		},
			(err) => {
				this.typeError = this.errorHandler.handleError(err);
			})
	}
}
