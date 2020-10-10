import {Component, Inject, OnInit} from '@angular/core';
import {delay} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {TitlebarService} from '../../service/titlebar.service';
import {UserService} from '../../service/user.service';
import {TaskNewDialogComponent} from "../../dialogs/task-new-dialog/task-new-dialog.component";
import {TaskDeleteModalComponent} from "../../dialogs/task-delete-modal/task-delete-modal.component";
import {TaskService} from "../../service/task.service";
import { Task } from 'src/app/model/Task';
import {Course} from "../../model/Course";
import {CourseService} from "../../service/course.service";
import {AuthService} from "../../service/auth.service";
import {JWTToken} from "../../model/JWTToken";
import {Submission} from "../../model/Submission";
import {SubmissionService} from "../../service/submission.service";

/**
 * Shows a task in detail
 */
@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute, private titlebar: TitlebarService, private dialog: MatDialog,
              private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, private taskService: TaskService, private courseService: CourseService,
              private submissionService: SubmissionService,
              private authService: AuthService, @Inject(DOCUMENT) document) {
  }

  task: Task;
  course: Course;
  submissions: Submission[];
  token: JWTToken;
  deadlineTask: boolean;
  submissionStatus: boolean;
  lastSubmission: Submission;
  submissionData: String | File;

  // alt
  userRole: string;

  ngOnInit() {
    this.submissionData = null;
    this.deadlineTask = false;
    this.submissionStatus = null;
    this.lastSubmission = null;

    // Get course id from url and receive data
    this.route.params.subscribe(
      params => {
        let courseID = +params['id'];
        let taskID = params.taskid;
        this.getInformation(courseID, taskID);
      }, () => this.router.navigate(['404'])
    );
      if(this.submissions.length != 0) {
        this.submissionStatus = this.getStatus();
        // find the latest submission to display the result
        let max = Math.max.apply(Math, this.submissions.map(sub => { return sub.submissionTime}));
        this.lastSubmission = this.submissions.find(sub => sub.submissionTime ==max);
      }

      this.titlebar.emitTitle(this.course.name);

    // Check if task reached deadline TODO: this needs work
    setInterval(() => {
      if (!this.submissionStatus) {
        let now: number = Date.now();
        this.deadlineTask = this.reachedDeadline(now, this.task.deadline);
      }
    }, 1000);
  }

  /**
   * function to get Information from Services
   * @param cid Course ID
   * @param tid Task ID
   */
  private getInformation(cid: number, tid: number){
    this.taskService.getTask(cid, tid).subscribe(
      task => {
        if (Object.keys(task).length == 0) {
          this.router.navigate(['404']);
        }
        this.task = task;
      }
    ), () => {this.router.navigate(['404'])}

    this.courseService.getCourse(cid).subscribe(
      course => {
        if (Object.keys(course).length == 0) {
          this.router.navigate(['404']);
        }
        this.course = course;
      }
    ), error => {this.router.navigate(['404'])};
    this.getSubmissions(cid, tid);
    this.token = this.authService.getToken()
  }

  getSubmissions(cid: number, tid: number){
    try {
      this.submissionService.getAllSubmissions(1, cid, tid).subscribe(
        submissions => {
          // TODO: error handling
          if (submissions != null) {
            this.submissions = submissions;
          }
        }
      );
    } catch (e) {
      this.submissions = []
      this.lastSubmission
    }
  }

  // true if the user has passed the task successfully
  private getStatus(): boolean {
    if (this.submissions.length==0) return null
    for (let sub of this.submissions){
      if (!sub.done || sub.results.find(element => element.exitCode != 0)) return false
    }
    return true
  }

  private reachedDeadline(now: number, deadline: number): boolean {
    return now > deadline;
  }

  public submissionTypeOfTask(): String {
    let mediaType = this.task.mediaType;
    if (mediaType.toLowerCase().includes("text")) return "text"
    else return "file"
  }

  /**
   * Submission of user solution
   */
  submission() {
    if (this.submissionData == null) {
      this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + this.task.name + ' abgegeben', 'Ups!');
      return;
    } else {
      // if user submits but there is a pending submission
      if (this.submissions.length != 0) {
        if (this.submissions.find(submission => !submission.done)) {
          this.snackbar.open('Für Aufgabe "' + this.task.name +
            '" wird noch auf ein Ergebnis gewartet, trotzdem abgeben ?', 'Ja', {duration: 10000})
            .onAction()
            .subscribe(() => {
              this.submit();
            });
          // TODO: reload submissioins, to see if its done?
          this.getSubmissions(this.course.id, this.task.id);
          return;
        }
      }
      this.submit()
    }
  }

  private submit() {
    console.log(this.submissionData)
    this.submissionService.submitSolution(this.token.id, this.course.id, this.task.id, this.submissionData).subscribe(
      res => {
        console.log(res)
        if(res.done) {
          this.submissions.push(res);
          this.result(res);
        } else {
          this.snackbar.open("Deine Aufgabe wird überprüft, bitte warte kurz.",'OK', {duration: 3000});
          this.submissionService.getSubmission(this.token.id, this.course.id, this.task.id, res.id).pipe(
            delay(2000)
          ).subscribe(res2 =>{
            this.submissions.push(res2);
            if(res2.done){
              this.result(res2)// TODO result??
            } else {
              this.snackbar.open("Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",'OK', {duration: 3000});
            }
          });
        }
      }, error => {
        this.snackbar.open("Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",'OK', {duration: 3000});
      }
    );
  }

  private result(submission: Submission){
    this.lastSubmission = submission;
    this.submissionStatus = this.getStatus();
    if(this.submissionStatus) {
      this.snackbar.open("Du hast erfolgreich bestanden.",'OK', {duration: 3000});
    } else {
      this.snackbar.open("Das musst du wohl nochmal probieren.", 'OK', {duration: 3000});
    }
  }

  public isAuthorized(roles: String[]) {
    // if (roles.find(role => role == 'dozent')) return true TODO: do the roles match??
    return true // TODO
    // return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor';
  }

  private updateSubmissionContent(data: any) {
    this.submissionData = data['content'];
  }

  // TODO: there is no route for this
  // public runAllTaskAllUsers() {
  //   this.taskService.restartAllSubmissions(1,1,1,1)
  // }

  reRun() {
    if(this.lastSubmission != null) {
      this.submissionService.restartSubmission(this.token.id, this.course.id, this.task.id, this.lastSubmission.id);
      this.getSubmissions(this.course.id, this.task.id);
    }
  }

  /**
   * Opens dialog to update task
   */
  updateTask() {
    this.dialog.open(TaskNewDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {
        task: this.task
      }
    }).afterClosed().subscribe(
      res => {
        if (res.success){
          this.snackbar.open('Update der Aufgabe ' + this.task.name + ' erfolgreich', 'OK', {duration: 3000});
          this.getInformation(this.course.id, this.task.id);
        }
      });
  }

  /**
   * Opens snackbar and asks
   * if docent/tutor really wants to delete
   * this task
   */
  deleteTask() {
    this.dialog.open(TaskDeleteModalComponent, {
      data: {taskname: this.task.name}
    }).afterClosed().subscribe( value => {
      if (value.exit){
        this.taskService.deleteTask(this.course.id, this.task.id).subscribe(
          res => {
            this.snackbar.open('Dieser Task wurde gelöscht.', 'Ok', {duration: 10000})
              .onAction()
              .subscribe(() => {
                this.router.navigate(['courses',this.course.id]);
              });
          });
      }
    });
  }

  isInRole(roles: string[]): Boolean {
    return roles.indexOf(this.userRole) >= 0;
  }
}
