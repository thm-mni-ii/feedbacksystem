import {Component, Inject, OnInit} from '@angular/core';
import {delay, flatMap, retryWhen, take} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {
  CourseTask, CourseTaskEvaluation,
  DetailedCourseInformation, DetailedCourseInformationSingleTask,
  Succeeded,
  SucceededUpdateTask
} from '../../model/HttpInterfaces';
import {DatabaseService} from '../../service/database.service';
import {TitlebarService} from '../../service/titlebar.service';
import {UserService} from '../../service/user.service';
import {TaskNewDialogComponent} from "../../dialogs/task-new-dialog/task-new-dialog.component";
import {CourseUpdateDialogComponent} from "../../dialogs/course-update-dialog/course-update-dialog.component";
import {CourseDeleteModalComponent} from "../../dialogs/course-delete-modal/course-delete-modal.component";
import {TaskDeleteModalComponent} from "../../dialogs/task-delete-modal/task-delete-modal.component";
import {TaskService} from "../../service/task.service";
import { Task } from 'src/app/model/Task';
import {Course} from "../../model/Course";
import {CourseService} from "../../service/course.service";
import {AuthService} from "../../service/auth.service";
import {JWTToken} from "../../model/JWTToken";
import {Submission} from "../../model/Submission";

/**
 * Shows a course in detail
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
              private authService: AuthService, @Inject(DOCUMENT) document) {
  }


  task: Task;
  course: Course;
  submissions: Submission[];
  token: JWTToken;
  deadlineTask: boolean;
  submissionStatus: boolean;



  // alt
  courseDetail: DetailedCourseInformationSingleTask = <DetailedCourseInformationSingleTask>{};
  courseTask: CourseTask = {} as CourseTask;
  userRole: string;
  submissionData: string | File;
  processing: boolean;
  submissionAsFile: string;

  courseID: number;
  taskID: number;

  ngOnInit() {
    this.submissionAsFile = '';
    this.processing = false;
    this.submissionData = null;
    this.deadlineTask = false;
    this.submissionStatus = false;


    // Get course id from url and receive data
    this.route.params.subscribe(
      params => {
        this.courseID = +params['id'];
        this.taskID = params.taskid;
        this.getInformation(this.courseID, this.courseID);
      }, error => this.router.navigate(['404'])
    );

      this.submissionStatus = this.getStatus();
      this.submissionAsFile = 'task';
      this.processing = false;
      // this.triggerExternalDescriptionIfNeeded(this.courseTask, false);
      this.titlebar.emitTitle(this.course.name);

    // Check if task reached deadline TODO: this needs work
    setInterval(() => {
      if (this.courseTask) {
        if (this.courseTask) {
          let now : number = Date.now()
          this.deadlineTask = false //this.reachedDeadline(now, this.task.deadline);
        }
      }
    }, 1000);

  }

  /**
   * function to get Information from Services
   * @param cid Course ID
   * @param tid Task ID
   */
  private getInformation(cid: number, tid: number){
    this.taskService.getTask(this.courseID, this.taskID).subscribe(
      task => {
        if (Object.keys(task).length == 0) {
          this.router.navigate(['404']);
        }
        this.task = task;
      }
    );
    this.courseService.getCourse(cid).subscribe(
      course => {
        if (Object.keys(course).length == 0) {
          this.router.navigate(['404']);
        }
        this.course = course;
      }
    );
    this.taskService.getAllSubmissions(1, cid, this.task.id).subscribe(
      submissions => {
        if (Object.keys(submissions).length == 0) {
          this.router.navigate(['404']);
        }
        this.submissions = submissions;
      }
    );
    this.token = this.authService.getToken()
  }

  // TODO: This is to display if the task has been done or not
  private getStatus(): boolean {
    return false;
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
    console.log(this.submissionData)
    if (this.submissionData == null) {
      console.log("HI");
      this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + this.task.name + ' abgegeben', 'Ups!');
      return;
    } else {
      // TODO: implement submission, especially the result!
        this.submit();
      this.snackbar.open("You submitted something!", "Yay.");
    }

    // TODO: is this important?
    // if user submits but there is a pending submission
    // if (currentTask.submit_date && this.isInFetchingResultOfTasks(currentTask)) {
    //   this.snackbar.open('Für Aufgabe "' + currentTask.task_name +
    //     '" wird noch auf ein Ergebnis gewartet, trotzdem abgeben ?', 'Ja', {duration: 10000})
    //     .onAction()
    //     .subscribe(() => {
    //       this.submitTask(currentTask);
    //     });
    // } else {
    //   this.submitTask(currentTask);
    // }
  }

  private submit() {
    this.processing = true;

    this.taskService.submitSolution(this.token.id, this.course.id, this.task.id, this.submissionData).subscribe(
      res => {
        // TODO: handle result here
        this.submissionStatus = true;
      }, error => {
        this.snackbar.open("Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.");
      }
    );
    // if (res.success) {
    //     this.db.getTaskResult(currentTask.task_id).pipe(
    //       flatMap(taskResult => {
    //         this.courseTask = taskResult;
    //         if (this.isInFetchingResultOfTasks(taskResult)) {
    //           return throwError('No result yet');
    //         }
    //         return of(taskResult);
    //       }),
    //       retryWhen(errors => errors.pipe(
    //         delay(5000),
    //         take(120)))
    //     ).subscribe(taskResult => {
    //       this.processing = false;
    //       this.courseTask = taskResult;
    //     });

  }


  public isAuthorized() {
    return true // TODO
    // return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor';
  }

  private updateSubmissionContent(data: any) {
    this.submissionData = data['content'];
  }

  public runAllTaskAllUsers() {
    this.taskService.restartAllSubmissions(1,1,1,1)
  }

  // reRunTask(task: CourseTask) {
  //   this.submissionData = task.submission_data;
  //   this.submitTask(task);
  // }
  //
  // public isInFetchingResultOfTasks(task: CourseTask) {
  //   const tasksystemPassed = task.evaluation
  //     .map( (eva: CourseTaskEvaluation) => eva.passed );
  //   const tasksystemNulls = tasksystemPassed.filter(passed => {
  //     return (passed == null || typeof passed === undefined);
  //   });
  //   if (tasksystemPassed.indexOf(false) >= 0) {
  //     return false;
  //   } else {
  //     return tasksystemNulls.length > 0;
  //   }
  // }
  //


  /**
   * Opens dialog to update task
   * @param task The task to update
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
   * @param task The task that will be deleted
   */
  deleteTask() {
    this.dialog.open(TaskDeleteModalComponent, {
      data: {taskname: this.task.name}
    }).afterClosed().subscribe( value => {
      if (value.exit){
        this.taskService.deleteTask(this.course.id, this.task.id); // TODO: Should send back status (Fehlerbehandlung)
        this.router.navigate(['courses',this.course.id]);
      }
    });
  }

  isInRole(roles: string[]): Boolean {
    return roles.indexOf(this.userRole) >= 0;
  }

}
