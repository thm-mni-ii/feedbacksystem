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

  // alt
  courseDetail: DetailedCourseInformationSingleTask = <DetailedCourseInformationSingleTask>{};
  courseTask: CourseTask = {} as CourseTask;
  userRole: string;
  submissionData: string | File;
  processing: boolean;
  submissionAsFile: string;

  courseID: number;
  breakpoint: number;
  taskID: number;

  ngOnInit() {
    this.submissionAsFile = '';
    this.processing = false;
    this.submissionData = '';
    this.deadlineTask = false;

    // Get course id from url and receive data
    this.route.params.subscribe(
      params => {
        this.courseID = +params['id'];
        this.taskID = params.taskid;
        this.getInformation(this.courseID, this.courseID);
      }, error => this.router.navigate(['404'])
    );

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

    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3; // TODO: whats this for?
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

  private reachedDeadline(now: number, deadline: number): boolean {
    return now > deadline;
  }

  public submissionTypeOfTask(): String {
    let mediaType = this.task.mediaType;
    if (mediaType.toLowerCase().includes("text")) return "text"
    else return "file"
  }

  // TODO: can this be deleted?
  // private externalInfoPoller(task: CourseTask, step: number) {
  //   if (step > 10) {
  //     this.snackbar.open('Leider konnte keine externe Aufgabenstellung geladen werden.', 'OK', {duration: 5000});
  //     return;
  //   }
  //   this.db.getTaskResult(task.task_id).toPromise()
  //     .then((loadedTask: CourseTask) => {
  //       if (loadedTask.external_description != null) {
  //         this.courseTask = loadedTask;
  //         if (this.externalInfoIsForm(loadedTask)) { this.submissionAsFile = 'choice'; }
  //       } else {
  //         setTimeout(() => {
  //           this.externalInfoPoller(task, step + 1);
  //         }, 5000);
  //       }
  //     });
  // }
  //
  // externalInfoIsForm(task: CourseTask) {
  //   if (!task.load_external_description || !task.external_description) {
  //     return false;
  //   } else {
  //     try {
  //       return JSON.parse(task.external_description);
  //     } catch (e) {
  //       return false;
  //     }
  //   }
  // }
  //
  // public triggerExternalDescriptionIfNeeded(task: CourseTask, force: Boolean) {
  //   if (force) {
  //     task.external_description = '';
  //   }
  //   if (task.load_external_description && task.external_description == null || force) {
  //     this.db.triggerExternalInfo(task.task_id, task.testsystems[0].testsystem_id).toPromise().then(() => {
  //       this.externalInfoPoller(task, 0);
  //     }).catch(() => {
  //       this.snackbar.open('Leider konnte keine externe Aufgabenstellung geladen werden.', 'OK', {duration: 5000});
  //     });
  //   }
  // }
  //
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }

  // TODO: can this be deleted? Should be in course-detail
  // public deleteCourse(courseDetail: DetailedCourseInformation) {
  //   this.dialog.open(CourseDeleteModalComponent, {
  //     data: {coursename: courseDetail.course_name, courseID: courseDetail.course_id}
  //   }).afterClosed().pipe(
  //     flatMap(value => {
  //       if (value.exit) {
  //         return this.db.deleteCourse(courseDetail.course_id);
  //       }
  //     })
  //   )
  //     .toPromise()
  //     .then( (value: Succeeded) => {
  //       if (typeof value == 'undefined') {
  //         return ;
  //       }
  //       if (value.success) {
  //         this.snackbar.open('Kurs mit der ID ' + courseDetail.course_id + ' wurde gelöscht', 'OK', {duration: 5000});
  //       } else {
  //         this.snackbar.open('Leider konnte der Kurs ' + courseDetail.course_id + ' nicht gelöscht werden. Dieser Kurs scheint nicht zu existieren.', 'OK', {duration: 5000});
  //       }
  //     })
  //     .catch(() => {
  //       this.snackbar.open('Leider konnte der Kurs ' + courseDetail.course_id + ' nicht gelöscht werden. Wahrscheinlich hast du keine Berechtigung', 'OK', {duration: 5000});
  //     })
  //     .then(() => {
  //       this.router.navigate(['courses']);
  //     });
  // }
  //
  public isAuthorized() {
    return true // TODO
    // return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor';
  }

  public runAllTaskAllUsers() {
    this.taskService.restartAllSubmissions(1,1,1,1)
  }
  //
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
  // private submitTask(currentTask: CourseTask) {
  //   this.processing = true;
  //   this.courseTask.submission_data = '';
  //   this.db.submitTask(currentTask.task_id, this.submissionData).subscribe(res => {
  //     this.submissionData = '';
  //
  //     if (res.success) {
  //       this.db.getTaskResult(currentTask.task_id).pipe(
  //         flatMap(taskResult => {
  //           this.courseTask = taskResult;
  //           if (this.isInFetchingResultOfTasks(taskResult)) {
  //             return throwError('No result yet');
  //           }
  //           return of(taskResult);
  //         }),
  //         retryWhen(errors => errors.pipe(
  //           delay(5000),
  //           take(120)))
  //       ).subscribe(taskResult => {
  //         this.processing = false;
  //         this.courseTask = taskResult;
  //       });
  //
  //     }
  //   });
  // }

  /**
   * Opens dialog for creation of new task
   * @param course The course data for dialog
   */
  // createTask(course: DetailedCourseInformation) {
  //   this.dialog.open(TaskNewDialogComponent, {
  //     height: 'auto',
  //     width: 'auto',
  //     data: {courseID: course.course_id}
  //   }).afterClosed().pipe(
  //     flatMap((value) => {
  //       if (value.success) {
  //         this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
  //       }
  //       return this.db.getCourseDetailOfTask(course.course_id, this.taskID);
  //     })
  //   ).subscribe(course_detail => {
  //     this.courseTask = course_detail.task;
  //
  //     if (typeof this.submissionAsFile == 'undefined') {
  //       if (this.externalInfoIsForm(this.courseTask)) {
  //         this.submissionAsFile = 'choice';
  //       } else {
  //         this.submissionAsFile = 'text';
  //       }
  //     }
  //   });
  // }

  /**
   * Opens dialog to update task
   * @param task The task to update
   */
  // updateTask(task: CourseTask) {
  //   this.dialog.open(TaskNewDialogComponent, {
  //     height: 'auto',
  //     width: 'auto',
  //     data: {
  //       task: task
  //     }
  //   }).afterClosed().pipe(
  //     flatMap((value: SucceededUpdateTask) => {
  //       if (value.success) {
  //         this.snackbar.open('Update der Aufgabe ' + task.task_name + ' erfolgreich', 'OK', {duration: 3000});
  //       }
  //       return this.db.getCourseDetailOfTask(this.courseDetail.course_id, this.taskID);
  //     })
  //   ).subscribe(course_detail => {
  //     this.courseTask = course_detail.task;
  //   });
  // }
  //
  // /**
  //  * Opens snackbar and asks
  //  * if docent/tutor really wants to delete
  //  * this task
  //  * @param task The task that will be deleted
  //  */
  // deleteTask(task: CourseTask) {
  //   this.dialog.open(TaskDeleteModalComponent, {
  //     data: {taskname: task.task_name}
  //   }).afterClosed().pipe(
  //     flatMap(value => {
  //       if (value.exit) {
  //         return this.db.deleteTask(task.task_id);
  //       }
  //     })
  //   ).toPromise()
  //     .then( (value: Succeeded) => {
  //       if (value.success) {
  //         this.snackbar.open('Aufgabe ' + task.task_name + ' wurde gelöscht', 'OK', {duration: 3000});
  //         this.loadCourseDetailsTasks();
  //       } else {
  //         this.snackbar.open('Aufgabe ' + task.task_name + ' konnte nicht gelöscht werden', 'OK', {duration: 3000});
  //       }
  //     })
  //     .catch((e) => {
  //       this.snackbar.open('Es gab ein Datenbankfehler, Aufgabe ' + task.task_name + ' konnte nicht gelöscht werden', 'OK', {duration: 3000});
  //     });
  // }
  //
  // /**
  //  * Get file user wants to submit
  //  * @param file The file user submits
  //  * @param currentTask The current task to get file from
  //  */
  // getSubmissionFile(file: File, currentTask: CourseTask) {
  //   this.submissionData = file;
  // }
  //
  // updateSubmissionContent(payload: any) {
  //   this.submissionData = payload['content'];
  // }
  //
  // /**
  //  * Submission of user solution
  //  * @param courseID Current course
  //  * @param currentTask The current task for submission
  //  */
  // submission(courseID: number, currentTask: CourseTask) {
  //   if (this.submissionData == null) {
  //     this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + currentTask.task_name + ' abgegeben', 'Ups!');
  //     return;
  //   }
  //
  //   // if user submits but there is a pending submission
  //   if (currentTask.submit_date && this.isInFetchingResultOfTasks(currentTask)) {
  //     this.snackbar.open('Für Aufgabe "' + currentTask.task_name +
  //       '" wird noch auf ein Ergebnis gewartet, trotzdem abgeben ?', 'Ja', {duration: 10000})
  //       .onAction()
  //       .subscribe(() => {
  //         this.submitTask(currentTask);
  //       });
  //   } else {
  //     this.submitTask(currentTask);
  //   }
  // }
  //
  // /**
  //  * Opens dialog to update course information
  //  */
  // updateCourse() {
  //   this.dialog.open(CourseUpdateDialogComponent, {
  //     height: '600px',
  //     width: '800px',
  //     data: {data: this.courseDetail}
  //   }).afterClosed().subscribe((value: Succeeded) => {
  //     location.hash = '';
  //     if (value.success) {
  //       this.db.getCourseDetailOfTask(this.courseID, this.taskID).subscribe(courses => {
  //         this.courseDetail = courses;
  //         this.titlebar.emitTitle(this.courseDetail.course_name);
  //       });
  //     }
  //   });
  // }

  // /**
  //  * If user gets course directly from link
  //  */
  // subscribeCourse() {
  //   this.db.subscribeCourse(this.courseID).pipe(
  //     flatMap(success => {
  //       if (success.success) {
  //         this.snackbar.open('Kurs ' + this.courseDetail.course_name + ' beigetreten', 'OK', {duration: 3000});
  //         return this.db.getCourseDetailOfTask(this.courseID, this.taskID);
  //       }
  //     })
  //   ).subscribe(courseDetail => {
  //     this.courseDetail = courseDetail;
  //     this.courseTask = courseDetail.task;
  //   });
  // }

  isInRole(roles: string[]): Boolean {
    return roles.indexOf(this.userRole) >= 0;
  }
}
