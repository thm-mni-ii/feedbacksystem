import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TitlebarService} from '../../../service/titlebar.service';
import {ActivatedRoute} from '@angular/router';
import {CourseResultsService} from '../../../service/course-results.service';
import {CourseResult} from '../../../model/CourseResult';
import {Task} from '../../../model/Task';
import {SubmissionService} from '../../../service/submission.service';
import {AllSubmissionsComponent} from '../../../dialogs/all-submissions/all-submissions.component';
import {MatDialog} from '@angular/material/dialog';
import {TaskPointsService} from '../../../service/task-points.service';
import {Requirement} from '../../../model/Requirement';
import {EvaluationUserResults} from '../../../model/EvaluationUserResults';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { Color, Label } from 'ng2-charts';

/**
 * Matrix for every course docent a has
 */
@Component({
  selector: 'app-course-results',
  templateUrl: './course-results.component.html',
  styleUrls: ['./course-results.component.scss'],
})
export class CourseResultsComponent implements OnInit {

  constructor(private courseResultService: CourseResultsService, private tb: TitlebarService,
              private route: ActivatedRoute, private submissionService: SubmissionService,
              private dialog: MatDialog, private taskPointsService: TaskPointsService) {}
  courseId: number;
  courseResults: Observable<CourseResult[]> = of();
  tasks: Observable<Task[]> = of();
  requirements: Observable<Requirement[]> = of();
  evaluationUserResults: Observable<EvaluationUserResults[]> = of();
  requirementTaskNames: void;
  allBonusPoints: Observable<Number[]>;
  courseBonusPoints = 0;
  results;
  avg;

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
      this.evaluationUserResults = this.courseResultService.getRequirementCourseResults(this.courseId);
      this.tasks = this.courseResults.pipe(map(results => (results.length === 0) ? [] : results[0].results.map(result => result.task)));
      this.requirements = this.taskPointsService.getAllRequirements(this.courseId);
      // this.requirementTaskNames = this.requirements.pipe(map(bp => bp[0].tasks.map(task => task.name)));
      this.tasks.pipe(map(t => t.map(t => t.name))).subscribe(names => this.barChartLabels = names);

      this.courseResults.pipe(map((extractedCResult) => { //Berechnung Durchschnittliche Versuche zum Bestehen einer Aufgabe
          return extractedCResult.reduce((acc, extractedCResult) => {
            extractedCResult.results.forEach((t) => {
              if (t.passed) {
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

      this.courseResults.pipe(map((extractedCResult2) => { //Berechnung Durchschnittliche Versuche einer Aufgabe
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
    });
    // TODO: material progress spinner (cause the page might load for a while)
  }

  downloadResults() {
    // TODO
    // let data: Object[]
    // this.tasks
    //   .subscribe(tasks => {
    //     const taskNames: String[] = tasks.map(task => task.name)
    //     console.log(taskNames)
    //     this.courseResults.subscribe(results => {
    //      const temp = results.map(res => {})
    //     })
    //   })
  }

  showResult(uid: number, cid: number, tid: number) {
    this.submissionService.getAllSubmissions(uid, cid, tid)
      .subscribe(res => {
        this.dialog.open(AllSubmissionsComponent, {
          width: '100%',
          data: {
            submission: res
          },
        });
      });
    // TODO: show results
  }


}
