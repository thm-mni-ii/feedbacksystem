import {Component, Inject, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Task} from '../../../model/Task';
import {UserTaskResult} from '../../../model/UserTaskResult';
import {Course} from '../../../model/Course';
import {TaskService} from '../../../service/task.service';
import {AuthService} from '../../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {ExternalClassroomService} from '../../../service/external-classroom.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CourseService} from '../../../service/course.service';
import {CourseRegistrationService} from '../../../service/course-registration.service';
import {FeedbackAppService} from '../../../service/feedback-app.service';
import {GoToService} from '../../../service/goto.service';
import {CheckerService} from '../../../service/checker.service';
import {DOCUMENT} from '@angular/common';
import {Roles} from '../../../model/Roles';

@Component({
  selector: 'app-sql-checker-results',
  templateUrl: './sql-checker-results.component.html',
  styleUrls: ['./sql-checker-results.component.scss']
})
export class SqlCheckerResultsComponent {
  constructor(private taskService: TaskService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private titlebar: TitlebarService,
              public externalClassroomService: ExternalClassroomService,
              private dialog: MatDialog,
              private auth: AuthService,
              private snackbar: MatSnackBar,
              private router: Router,
              private courseService: CourseService,
              private courseRegistrationService: CourseRegistrationService,
              private feedbackAppService: FeedbackAppService,
              private goToService: GoToService,
              private checkerService: CheckerService,
              @Inject(DOCUMENT) document) {
  }
  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;
  taskID: number;

  ngOnInit() {
      this.route.params.subscribe(
        param => {
          this.courseID = param.id;
          this.taskID = param.tid;
        }
      );
      this.taskService.getAllTasks(this.courseID).subscribe(tasks => {
        this.taskService.getTaskResults(this.courseID).subscribe(taskResults => {
          this.tasks = tasks;
          this.taskResults = taskResults.reduce((acc, res) => {acc[res.taskID] = res; return acc; }, {});
        });
      });
      this.role = this.auth.getToken().courseRoles[this.courseID];
      if (this.goToService.getAndClearAutoJoin() && !this.role) {
        this.courseRegistrationService.registerCourse( this.authService.getToken().id, this.courseID)
          .subscribe(() => this.courseService.getCourse(this.courseID).subscribe(() => this.ngOnInit())
            , error => console.error(error));
      }
    }

  public isAuthorized(ignoreTutor: boolean = false) {
      const token = this.auth.getToken();
      const courseRole = token.courseRoles[this.courseID];
      const globalRole = token.globalRole;
      return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole)
        || Roles.CourseRole.isDocent(courseRole) || (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor);
    }
  }
