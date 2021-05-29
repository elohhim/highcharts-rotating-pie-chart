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

  readonly data = [4, 4, 12];

  options$: Observable<Highcharts.Options>;
  startAngle$ = new BehaviorSubject<number>(0);

  constructor(private _ngZone: NgZone) {}

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
      plotOptions: {
        series: {
          allowPointSelect: true,
          point: {
            events: {
              select() {
                _this._ngZone.run(() =>
                  _this.recalculateAngle(this)
                );
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
          }
        }
      ]
    };
  }

  recalculateAngle(point: Highcharts.Point): void {
    const targetAngle = 90;
    const preceedingAngle = point.series.points
      .filter((_, index) => index < point.index) // preceeding points
      .map(p => p.percentage)
      .map(AppComponent.percentageToDegree)
      .reduce((a, b) => a + b, 0);
    const pointMiddleAngle =
      AppComponent.percentageToDegree(point.percentage) / 2;
    const startAngle = targetAngle - pointMiddleAngle - preceedingAngle;
    this.startAngle$.next(startAngle);
  }

  private static percentageToDegree(percentage: number): number {
    return (percentage / 100) * 360;
  }
}
