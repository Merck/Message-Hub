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

import { EventsBySourceComponent } from './events-by-source.component';
import { of } from 'rxjs';
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
			datasets: [],
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

describe('EventsBySourceComponent', () => {
	let component: EventsBySourceComponent;
	let metricsServiceMock: any;
	let errorHandlerMock: any;
	let successResponse = [{ "source": "ATTP", "number": 9875 }, { "source": "Systech", "number": 3249 }, { "source": "Digital Fingerprinting", "number": 997 }, { "source": "eLeaflet", "number": 3 }]

	beforeEach(async(() => {
		metricsServiceMock = {
			getSourceData: jest.fn().mockImplementation(() => of(successResponse))
		};
		errorHandlerMock = {
			handleError: jest.fn()
		}
		TestBed.configureTestingModule({
			declarations: [EventsBySourceComponent]
		});
		component = new EventsBySourceComponent(metricsServiceMock, errorHandlerMock);
		component.ngOnInit()
	}));

	it('should exist', () => {
		expect(component).toBeDefined();
	});
	it('should return success response', () => {
		expect(component.results).toBe(successResponse);
	});
});
