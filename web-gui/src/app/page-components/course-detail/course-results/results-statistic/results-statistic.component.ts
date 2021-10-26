import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TitlebarService} from '../../../../service/titlebar.service';
import {ActivatedRoute} from '@angular/router';
import {CourseResultsService} from '../../../../service/course-results.service';
import {CourseResult} from '../../../../model/CourseResult';
import {Task} from '../../../../model/Task';
import {EvaluationUserResults} from '../../../../model/EvaluationUserResults';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { Color, Label } from 'ng2-charts';
import {SubTaskStatistic} from "../../../../model/SubTaskStatistic";
import {SubtaskStatisticService} from "../../../../service/subtask-statistic.service";

@Component({
  selector: 'app-results-statistic',
  templateUrl: './results-statistic.component.html',
  styleUrls: ['./results-statistic.component.scss']
})
export class ResultsStatisticComponent implements OnInit {

  constructor(private courseResultService: CourseResultsService, private tb: TitlebarService,
              private route: ActivatedRoute, private subtaskStatisticService: SubtaskStatisticService) {}

  courseId: number;
  courseResults: Observable<CourseResult[]> = of();
  tasks: Observable<Task[]> = of();
  evaluationUserResults: Observable<EvaluationUserResults[]> = of();
  subtaskStatistic: Observable<SubTaskStatistic[]> = of();
  requirementTaskNames: void;
  courseBonusPoints = 0;
  results;
  avg;
  choosedTask;
  checker = 0;
  isButtonVisible = false;
  isTextVisible = true;
  isMissingSubTextVisible = false;

public barChartData: ChartDataSets[] = [
    { data: [], label: 'Durchschnittliche Versuche zum Bestehen einer Aufgabe' },
    { data: [], label: 'Durchschnittliche Versuche einer Aufgabe' },
  ];
public barChartLabels: Label[] = [];
public barChartOptions: (ChartOptions & {annotation ?: any}) = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ],
      xAxes: [
        {
          ticks: {

          }
        }
      ]
    }
  };

public barChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
public barChartLegend = true;
public barChartType: ChartType = 'bar';
public barChartPlugins = [];

  ngOnInit(): void {
    this.tb.emitTitle('Dashboard');
    this.route.params.subscribe(param => {
      this.courseId = param.id;
      this.courseResults = this.courseResultService.getAllResults(this.courseId);
      this.subtaskStatistic = this.subtaskStatisticService.getAllResults(this.courseId);
      this.tasks = this.courseResults.pipe(map(results => (results.length === 0) ? [] : results[0].results.map(result => result.task)));
    });
    this.standardEvent();
  }
  public chartClicked(e: any): void {
    if(this.choosedTask == ""){
      return;
    }
    else {
      this.isTextVisible = false;
      this.isButtonVisible = true;
      this.isMissingSubTextVisible = true;
    }
    if(this.checker == 1){
      return;
    }
    this.choosedTask = e.active[0]._model.label;
    this.checker = 1;
    this.barChartData[0].label = 'Maximale Punktzahl';
    this.barChartData[1].label = 'Durchschnittliche Punktzahl';
    this.barChartLabels = [];
    this.barChartData[0].data = [];
    this.barChartData[1].data = [];
    this.subtaskStatistic.subscribe(extractedSResults => {
      extractedSResults.forEach(extractedSResult => {
        if(extractedSResult.name == this.choosedTask) {
          extractedSResult.subtasks.forEach(t => {
            this.barChartData[0].data.push(t.maxPoints);
            this.barChartData[1].data.push(t.avgPoints);
            this.barChartLabels.push(String(t.name));
            this.isMissingSubTextVisible = false;
          })
        }
        })
    });
  }

  standardEvent(){
  this.isButtonVisible = false;
    this.isMissingSubTextVisible = false;
    this.isTextVisible = true;
    this.checker = 0;
    this.barChartData[0].label = 'Durchschnittliche Versuche zum vollständigen Bestehen aller (Unter-)Aufgaben';
    this.barChartData[1].label = 'Durchschnittliche Versuche einer Aufgabe';
    this.barChartLabels = [];
    this.barChartData[0].data = [];
    this.barChartData[1].data = [];
    this.tasks.pipe(map(t => t.map(t => t.name))).subscribe(names => this.barChartLabels = names);
    this.courseResults.pipe(map((extractedCResult) => { //Calculation average attempts to pass a task
        return extractedCResult.reduce((acc, extractedCResult) => {
          extractedCResult.results.forEach((t) => {
            if (t.passed == true) {
              if (acc[t.task.name] == null) acc[t.task.name] = [];
              acc[t.task.name].push(t.attempts);
            }
          });
          return acc;
        }, {});
      }),
      map((resultsObj) => {
        return Object.keys(resultsObj).map((key) => {
          const count = resultsObj[key].length;
          const sum = resultsObj[key].reduce((a, b) => a + b, 0);
          const avg = sum / count;
          this.barChartData[0].data.push(Number(avg));
        });
      })
    )
      .subscribe();

    this.courseResults.pipe(map((extractedCResult2) => { //Calculation average attempts of a task
        return extractedCResult2.reduce((acc, extractedCResult) => {
          extractedCResult.results.forEach((t) => {
            if (acc[t.task.name] == null) acc[t.task.name] = [];
            acc[t.task.name].push(t.attempts);
          });
          return acc;
        }, {});
      }),
      map((resultsObj) => {
        return Object.keys(resultsObj).map((key) => {
          const count = resultsObj[key].length;
          const sum = resultsObj[key].reduce((a, b) => a + b, 0);
          const avg = sum / count;
          this.barChartData[1].data.push(Number(avg));
        });
      })
    )
      .subscribe();
  }
}
