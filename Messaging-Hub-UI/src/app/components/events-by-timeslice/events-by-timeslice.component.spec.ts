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

import { async, TestBed } from '@angular/core/testing';

import { EventsByTimesliceComponent } from './events-by-timeslice.component';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

jest.mock('chart.js', () => {
	const mockedChart = {
		destroy: jest.fn(),
		update: jest.fn(),
		reset: jest.fn(),
		render: jest.fn(),
		stop: jest.fn(),
		resize: jest.fn(),
		clear: jest.fn(),
		toBase64Image: jest.fn(),
		generateLegend: jest.fn(),
		data: {
			datasets: [{
				label: 'Object',
				data: 23,
				backgroundColor: '#00877c',
				borderColor: '#00877c',
				fill: false
			},
			// {
			// 	label: 'Aggregation',
			// 	data: 46,
			// 	backgroundColor: '#879637',
			// 	borderColor: '#879637',
			// 	fill: false
			// },
			{
				label: 'Transaction',
				data: 29,
				backgroundColor: '#662046',
				borderColor: '#662046',
				fill: false
			},
			{
				label: 'Transformation',
				data: 80,
				backgroundColor: '#F68D2E',
				borderColor: '#F68D2E',
				fill: false
			}],
			labels: []
		},
		options: {
			scales: {
				yAxes: [{
					scaleLabel: {
					}
				}],
				xAxes: [{
					scaleLabel: {
					}
				}]
			}
		}
	};
	return jest.fn().mockImplementation((context: string, options: any) => {
		return mockedChart;
	});
});

describe('EventsByTimesliceComponent', () => {

	let component: EventsByTimesliceComponent;
	let metricsServiceMock: any;
	let translateServiceMock: any;
	let errorHandlerMock: any;
	let successResponse = [{ "period": "08/25/20", "obj": 100, "agg": 180, "trnsf": 340, "trnx": 100 }, { "period": "08/26/20", "obj": 100, "agg": 460, "trnsf": 1220, "trnx": 10 }, { "period": "08/27/20", "obj": 500, "agg": 90, "trnsf": 20, "trnx": 100 }, { "period": "08/28/20", "obj": 1100, "agg": 600, "trnsf": 190, "trnx": 100 }, { "period": "08/29/20", "obj": 230, "agg": 450, "trnsf": 290, "trnx": 20 }, { "period": "08/30/20", "obj": 2330, "agg": 1500, "trnsf": 1230, "trnx": 330 }, { "period": "08/31/20", "obj": 120, "agg": 930, "trnsf": 190, "trnx": 20 }]
	const formBuilder: FormBuilder = new FormBuilder();
	beforeEach(async(() => {
		metricsServiceMock = {
			getPeriodData: jest.fn().mockImplementation(() => of(successResponse))
		};
		errorHandlerMock = {
			handleError: jest.fn()
		}
		translateServiceMock = {
			get: jest.fn().mockImplementation(() => of(successResponse)),
			get onLangChange() { return of({ lang: 'en' }) }
		}
		TestBed.configureTestingModule({
			declarations: [EventsByTimesliceComponent]
		});
		component = new EventsByTimesliceComponent(metricsServiceMock, translateServiceMock, errorHandlerMock);
		component.periodForm = formBuilder.group({
			period: ['week']
		});
		component.ngOnInit();

	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should return success response for period week', () => {
		expect(component.results).toBe(successResponse);
	});
	it('should return success response when onPeriodChange function is called', () => {
		component.periodForm.patchValue({
			period: "past day"
		})
		component.onPeriodChange();
		expect(component.results).toBe(successResponse);
	});
	it('should return success response when onPeriodChange function is called', () => {
		component.periodForm.patchValue({
			period: "past hour"
		})
		component.onPeriodChange();
		expect(component.results).toBe(successResponse);
	});
});
