import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {TitlebarService} from '../../service/titlebar.service';
import {UserService} from '../../service/user.service';
import {TaskNewDialogComponent} from '../../dialogs/task-new-dialog/task-new-dialog.component';
import {TaskService} from '../../service/task.service';
import { Task } from 'src/app/model/Task';
import {CourseService} from '../../service/course.service';
import {AuthService} from '../../service/auth.service';
import {Submission} from '../../model/Submission';
import {SubmissionService} from '../../service/submission.service';
import {tap, map, mergeMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Roles} from '../../model/Roles';
import {AllSubmissionsComponent} from '../../dialogs/all-submissions/all-submissions.component';
import {ConfirmDialogComponent} from '../../dialogs/confirm-dialog/confirm-dialog.component';

/**
 * Shows a task in detail
 */
@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  courseId: number;
  task: Task;
  status: boolean | null = null;
  submissions: Submission[];
  lastSubmission: Submission;
  pending = false;

  deadlinePassed = false;

  constructor(private route: ActivatedRoute, private titlebar: TitlebarService, private dialog: MatDialog,
              private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, private taskService: TaskService, private courseService: CourseService,
              private submissionService: SubmissionService,
              private authService: AuthService, @Inject(DOCUMENT) document) {
    // Check if task reached deadline TODO: this needs work
    // setInterval(() => {
    //   if (!this.status) {
    //     let now: number = Date.now();
    //     this.deadlinePassed = this.reachedDeadline(now, this.task.deadline);
    //   }
    // }, 1000);
  }

  submissionData: string | File;

  ngOnInit() {
    this.route.params.pipe(
      mergeMap(params => {
        this.courseId = params.id;
        const taskId = params.tid;
        return this.taskService.getTask(this.courseId, taskId);
      }),
      mergeMap(task => {
        this.task = task;
        const uid = this.authService.getToken().id;
        this.titlebar.emitTitle(this.task.name);
        this.deadlinePassed = this.reachedDeadline(Date.now(), Date.parse(task.deadline));
        return this.submissionService.getAllSubmissions(uid, this.courseId, task.id);
      }),
      tap(submissions => {
        this.submissions = submissions;
        if (submissions.length === 0) {
          this.status = <boolean>null;
        } else {
          this.pending = !submissions[submissions.length - 1].done;
          this.status = submissions.reduce((acc, submission) => {
            const done = submission.done;
            const finalExitCode = submission.results.reduce((acc2, value) => acc2 + value.exitCode, 0);
            return acc || done && finalExitCode === 0;
          }, false);
          this.lastSubmission = submissions[submissions.length - 1];
        }
      })
    ).subscribe(ok => {this.refreshByPolling(); }, error => console.error(error));
  }

  private refreshByPolling(force = false) {
    setTimeout(() => {
      if (force || this.pending) {
        this.ngOnInit();
      }
    }, 5000); // 5 Sec
  }

  private reachedDeadline(now: number, deadline: number): boolean {
    return now > deadline;
  }

  public submissionTypeOfTask(): String {
    return 'spreadsheet'; // For debugging ToDo: remove
    const mediaType = this.task?.mediaType;
    if (mediaType?.toLowerCase().includes('text')) {
      return 'text';
    } else if (mediaType?.toLowerCase().includes('spreadsheet')) {
      return 'spreadsheet';
    } else {
      return 'file';
    }
  }

  isSubmissionEmpty(): boolean {
    const input = this.submissionData;
    if (!input) {
      return true;
    }
    if ((<any>input).name) {
      return (<File>input).size === 0;
    } else {
      return (<string>input).trim().length === 0;
    }
  }

  /**
   * Submission of user solution
   */
  submission() {
    if (this.isSubmissionEmpty()) {
      this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + this.task.name + ' abgegeben', 'Ups!');
      return;
    }
    this.submit();
  }

  private submit() {
    const token = this.authService.getToken();
    this.submissionService.submitSolution(token.id, this.courseId, this.task.id, this.submissionData).subscribe(
      ok => {
        this.pending = true;
        this.refreshByPolling(true);
        this.snackbar.open('Deine Abgabe wird ausgewertet.', 'OK', {duration: 3000});
      }, error => {
        console.error(error);
        this.snackbar.open('Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.', 'OK', {duration: 3000});
      });
  }

  public canEdit(): boolean {
    const globalRole = this.authService.getToken().globalRole;
    if (Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole)) {
      return true;
    }

    const courseRole = this.authService.getToken().courseRoles[this.courseId];
    return Roles.CourseRole.isTutor(courseRole) || Roles.CourseRole.isDocent(courseRole);
  }

  updateSubmissionContent(data: any) {
    this.submissionData = data['content'];
  }

  // TODO: there is no route for this
  // public runAllTaskAllUsers() {
  //   this.taskService.restartAllSubmissions(1,1,1,1)
  // }

  reRun() {
    if (this.lastSubmission != null) {
      const token = this.authService.getToken();
      this.submissionService.restartSubmission(token.id, this.courseId, this.task.id, this.lastSubmission.id)
        .subscribe(ok => { this.ngOnInit(); }, error => console.error(error));
    }
  }

  /**
   * Opens dialog to update task
   */
  updateTask() {
    this.dialog.open(TaskNewDialogComponent, {
      height: 'auto',
      width: '50%',
      data: {
        courseId: this.courseId,
        task: this.task
      }
    }).afterClosed().subscribe(
      res => {
        if (res.success) {
          this.snackbar.open('Update der Aufgabe ' + this.task.name + ' erfolgreich', 'OK', {duration: 3000});
          this.ngOnInit();
        }
      }, error => {
        console.error(error);
        this.snackbar.open('Update der Aufgabe ' + this.task.name + ' hat leider nicht funktioniert.', 'OK', {duration: 3000});
      });
  }

  /**
   * Opens snackbar and asks
   * if docent/tutor really wants to delete
   * this task
   */
  deleteTask() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Aufgabe löschen',
        message: `Aufgabe ${this.task.name} wirklich löschen? (Alle zugehörigen Abgaben werden damit auch gelöscht!)`
      }
    }).afterClosed()
      .pipe(mergeMap(confirmed => {
        return confirmed ? this.taskService.deleteTask(this.courseId, this.task.id).pipe(map(e => true)) : of(false);
      }))
      .subscribe(res => {
        if (res) {
          setTimeout(() => this.router.navigate(['courses', this.courseId]), 1000);
        }
      }, error => {
        console.error(error);
        this.snackbar.open('Aufgabe konnte leider nicht gelöscht werden.', 'OK', {duration: 3000});
      });
  }

  allSubmissions() {
    this.dialog.open(AllSubmissionsComponent, {
      height: '80%',
      width: '100%',
      data: {
        submission: this.submissions,
        auth: false
      },
    });
  }
}
