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
              private route: ActivatedRoute, private subtaskStatisticService: SubtaskStatisticService) {
  }

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
  cResults = [];
  taskChecker;
  taskCounter;

  //Bar-chart Config
  public barChartData: ChartDataSets[] = [
    {data: [], label: 'Durchschnittliche Versuche zum Bestehen einer Aufgabe'},
    {data: [], label: 'Durchschnittliche Versuche einer Aufgabe'},
  ];
  public barChartLabels: Label[] = [];
  public barChartOptions: (ChartOptions & { annotation?: any }) = {
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
          ticks: {}
        }
      ]
    }
  };

  public barChartColors: Color[] = [
    { backgroundColor: '#405e9a'},
    { backgroundColor: '#aab6fe'},
  ];
  public barChartLegend = true;
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [];


  //Line-chart Config
  lineChartData: ChartDataSets[] = [
    {data: [], label: 'Bearbeitungsquote %'},
  ];

  lineChartLabels: Label[] = [];

  lineChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            callback: function(value){
              return value + '%';
            }
          }
        }
      ],
      xAxes: [
        {
          ticks: {}
        }
      ]
    }
  };


  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: '#405e9a',
    },
  ];

  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType: ChartType = 'line';


  ngOnInit(): void {
    this.tb.emitTitle('Dashboard');
    this.route.params.subscribe(param => {
      this.courseId = param.id;
      this.courseResults = this.courseResultService.getAllResults(this.courseId);
      this.subtaskStatistic = this.subtaskStatisticService.getAllResults(this.courseId);
      this.tasks = this.courseResults.pipe(map(results => (results.length === 0) ? [] : results[0].results.map(result => result.task)));
    });
    this.standardEvent();
    this.showRate();
  }

  public chartClicked(e: any): void { //Show statistics of the subtasks after a task has been clicked
    if (this.checker === 1) {
      return;
    }
    this.choosedTask = e.active[0]._model.label;
        this.tasks.subscribe(extractedTasks => {
          extractedTasks.forEach(extractedTasks =>{
            if(extractedTasks.name === this.choosedTask){
              this.taskChecker = 1;
            }
          })
          if(this.taskChecker !== 1) return;
        });
      this.isTextVisible = false;
      this.isButtonVisible = true;
      this.isMissingSubTextVisible = true;

    this.choosedTask = e.active[0]._model.label;
    this.checker = 1;
    this.barChartData[0].label = 'Maximale Punktzahl';
    this.barChartData[1].label = 'Durchschnittliche Punktzahl';
    this.barChartLabels = [];
    this.barChartData[0].data = [];
    this.barChartData[1].data = [];
    this.subtaskStatistic.subscribe(extractedSResults => {
      extractedSResults.forEach(extractedSResult => {
        if (extractedSResult.name === this.choosedTask) {
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

  standardEvent() { //Statistics of the tasks get calculated
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
            if (t.passed) {
              if (!acc[t.task.name]) acc[t.task.name] = [];
              acc[t.task.name].push(t.attempts);
            }
            if (!t.passed){
              if (!acc[t.task.name]) acc[t.task.name] = [];
              acc[t.task.name].push(0);
            }
          });
          return acc;
        }, {});
      }),
      map((resultsObj) => {
        return Object.keys(resultsObj).map((key) => {
          this.taskCounter = 0;
         resultsObj[key].forEach((t) =>{
           if(t != 0){
             this.taskCounter++;
           }
         });
          const sum = resultsObj[key].reduce((a, b) => a + b, 0);
          const avg = sum / this.taskCounter;
          this.barChartData[0].data.push(Number(avg.toFixed(2)));
        });
      })
    )
      .subscribe();

    this.courseResults.pipe(map((extractedCResult2) => { //Calculation average attempts of a task
        return extractedCResult2.reduce((acc, extractedCResult) => {
          extractedCResult.results.forEach((t) => {
            if (!acc[t.task.name]) acc[t.task.name] = [];
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
          this.barChartData[1].data.push(Number(avg.toFixed(2)));
        });
      })
    )
      .subscribe();
  }

  showRate() { //Rate of tasks that have been edited at least once
    this.tasks.pipe(map(t => t.map(t => t.name))).subscribe(names => this.lineChartLabels = names);
    this.courseResults.pipe(map((extractedCResult2) => { //Calculation of the rate
        return extractedCResult2.reduce((acc, extractedCResult) => {
          extractedCResult.results.forEach((t) => {
            if (!acc[t.task.name]) acc[t.task.name] = [];
            if(t.attempts > 0) acc[t.task.name].push(1);
            else{acc[t.task.name].push(0);}
          });
          return acc;
        }, {});
      }),
      map((resultsObj) => {
        return Object.keys(resultsObj).map((key) => {
          const count = resultsObj[key].length;
          const sum = resultsObj[key].reduce((a, b) => a + b, 0);
          const avg = sum / count;
          const rate = avg * 100;
          this.lineChartData[0].data.push(Number(rate));
        });
      })
    )
      .subscribe();
  }
}
