import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, of, from} from 'rxjs';
import {flatMap, first, map} from 'rxjs/operators';
import {CourseTask, DashboardProf, GeneralCourseInformation} from '../../../model/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {UserService} from '../../../service/user.service';
import {ActivatedRoute} from "@angular/router";
import {CourseResultsService} from "../../../service/course-results.service";
import {CourseResult} from "../../../model/CourseResult";
import {Task} from "../../../model/Task";
import {SubmissionService} from "../../../service/submission.service";

/**
 * Matrix for every course docent a has
 */
@Component({
  selector: 'app-course-results',
  templateUrl: './course-results.component.html',
  styleUrls: ['./course-results.component.scss'],
})
export class CourseResultsComponent implements OnInit {
  courseId: number;
  courseResults: Observable<CourseResult[]> = of()
  tasks: Observable<Task[]> = of()

  constructor(private courseResultService: CourseResultsService, private tb: TitlebarService,
              private route: ActivatedRoute, private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.tb.emitTitle('Dashboard');
    this.route.params.subscribe(param => {
      this.courseId = param.id
      this.courseResults = this.courseResultService.getAllResults(this.courseId)
      this.tasks = this.courseResults.pipe(map(results => (results.length == 0) ? [] : results[0].results.map(result => result.task)))
    })
  }

  downloadResults() {
    let data: Object[]
    this.tasks
      .subscribe(tasks => {
        const taskNames: String[] = tasks.map(task => task.name)
        console.log(taskNames)
        this.courseResults.subscribe(results => {
         const temp = results.map(res => {})
        })
      })
  }

  showResult(uid: number, cid: number, tid: number) {
    this.submissionService.getAllSubmissions(uid, cid, tid)
      .subscribe(res => {
        console.log(res)
    })
    // TODO: show results
  }
}
