import { Component, NgZone, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly Highcharts: typeof Highcharts = Highcharts;

  readonly data = [
    ['Apples', 15],
    ['Oranges', 5],
    ['Kiwis', 10],
    ['Strawberries', 20]
  ];

  options$: Observable<Highcharts.Options>;
  startAngle$ = new BehaviorSubject<number>(0);

  ngOnInit(): void {
    this.options$ = this.startAngle$.pipe(
      map(startAngle => this.buildOptions(startAngle))
    );
  }

  buildOptions(startAngle: number): Highcharts.Options {
    const _this = this;
    return {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Rotating pie chart'
      },
      subtitle: {
        text:
          'Select data point and chart will rotate so it is positioned to the right'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          point: {
            events: {
              select() {
                _this.recalculateAngle(this);
              },
              legendItemClick() {
                const selectedPoint = this.series.points.find(p => p.selected);
                if (selectedPoint) {
                  setTimeout(() => _this.recalculateAngle(selectedPoint));
                }
              }
            }
          }
        }
      },
      series: [
        {
          type: 'pie',
          id: 'data',
          name: 'data',
          data: this.data,
          startAngle,
          innerSize: '80%',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      ],
      legend: {
        enabled: true,
        align: 'right'
      }
    };
  }

  recalculateAngle(point: Highcharts.Point): void {
    const targetAngle = 90;
    const preceedingAngle = point.series.points
      .filter(p => p.visible)
      .filter(p => p.index < point.index) // preceeding points
      .map(p => p.percentage)
      .map(AppComponent.percentageToDegree)
      .reduce((a, b) => a + b, 0);
    const pointMiddleAngle =
      AppComponent.percentageToDegree(point.percentage) / 2;
    const startAngle = targetAngle - pointMiddleAngle - preceedingAngle;
    console.log(startAngle);
    this.startAngle$.next(startAngle);
  }

  private static percentageToDegree(percentage: number): number {
    return (percentage / 100) * 360;
  }
}
