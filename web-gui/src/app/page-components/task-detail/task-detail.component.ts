import {AfterViewChecked, Component, Inject, OnInit} from '@angular/core';
import {delay, flatMap, retryWhen, take} from 'rxjs/operators';
import {of, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DOCUMENT} from '@angular/common';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {DomSanitizer} from '@angular/platform-browser';

import { Task } from '../../model/Task';
import { Course} from "../../model/Course";
import {
  CourseTask, CourseTaskEvaluation,
  DetailedCourseInformation, DetailedCourseInformationSingleTask,
  NewTaskInformation,
  Succeeded,
  SucceededUpdateTask
} from '../../model/HttpInterfaces';
import {DatabaseService} from '../../service/database.service';
import {TitlebarService} from '../../service/titlebar.service';
import {UserService} from '../../service/user.service';

import {TaskNewDialogComponent} from "../../dialogs/task-new-dialog/task-new-dialog.component";
// import {ExitCourseComponent} from './exit-course/exit-course.component';
import {CourseUpdateDialogComponent} from "../../dialogs/course-update-dialog/course-update-dialog.component";
import {DeleteCourseModalComponent} from "../../components/courses/modals/delete-course-modal/delete-course-modal.component";
import {TaskDeleteModalComponent} from "../../dialogs/task-delete-modal/task-delete-modal.component";
// import {TestsystemAnswerDialogComponent} from "../../dialogs/testsystem-answer-dialog/testsystem-answer-dialog.component";
import {ParameterCourseModalComponent} from "../../dialogs/parameter-course-modal/parameter-course-modal.component";
import {ParameterUserModalComponent} from "../../dialogs/parameter-user-modal/parameter-user-modal.component";
import {PlagiatScriptUploadComponent} from "../../dialogs/plagiat-script-upload/plagiat-script-upload.component";
import {TaskService} from "../../service/task.service";


/**
 * Shows a course in detail
 */
@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
//
   constructor(){} //private taskS: tasksService,
//
//     private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
//               private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
//               private router: Router, @Inject(DOCUMENT) document) {
//   }
//
//   // courseDetail: DetailedCourseInformationSingleTask = <DetailedCourseInformationSingleTask>{};
//   taskDetail: Task = <Task>{};
//   courseDetail: Course = <Course>{};
//   // taskDetail: CourseTask = {} as CourseTask;
//   userRole: string;
//   submissionData: string | File;
//   processing: boolean;
//   submissionAsFile: string;
//   deadlineTask: boolean;
//   courseID: number;
//   breakpoint: number;
//   // multipleChoices: { [task: number]: boolean };
//   taskID: number;
//
//
//   private reachedDeadline(now: Date, deadline: Date): boolean {
//     return now > deadline;
//   }
//
//   public submissionTypeOfTask(task: CourseTask): any[] { // TODO: Interface was ist testystem??
//     const accepted = [];
//     if (typeof task.testsystems === 'undefined') { return []; }
//
//     const flagg = task.testsystems[0].accepted_input;
//
//     if (flagg & 1) {
//       accepted.push({typ: 'text', text: 'Text'});
//     }
//     if ((flagg >> 1) & 1) {
//       accepted.push({typ: 'file', text: 'Datei'});
//     }
//     if ((flagg >> 2) & 1) {
//       accepted.push({typ: 'choice', text: 'Multiple Choice'});
//     }
//
//     return ['text', 'file', 'choice'].filter(v => {
//       return accepted.map(v => v.typ).indexOf(v) >= 0;
//     });
//   }
//
  ngOnInit() {
//     this.submissionAsFile = '';
//     this.processing = false;
//     this.submissionData = '';
//     this.deadlineTask = false;
//
//     // Get course id from url and receive data
//     this.route.params.pipe(
//       flatMap(params => {
//         this.courseID = +params['id'];
//         this.taskID = params.taskid;
//         return this.taskS.getTask(this.courseID, this.taskID);
//          // return this.db.getCourseDetailOfTask(this.courseID, this.taskID);
//       })
//     ).subscribe(task => {
//
//       if (Object.keys(task).length == 0) {
//         this.router.navigate(['404']);
//       }
//
//       // this.courseDetail = task; TODO: ist es hier wichtig, die Kursinformationen zu bekommen
//       this.taskDetail = task;
//       this.userRole = task.role_name;
//       this.submissionAsFile = 'task';
//       this.processing = false;
//       this.triggerExternalDescriptionIfNeeded(this.taskDetail, false);
//       this.titlebar.emitTitle(task.course_name);
//
//       setTimeout(() => {
//         if (location.hash === '#edit') {
//           this.updateCourse();
//         }
//       }, 100);
//
//     }, error => this.router.navigate(['404']));
//
//     // Check if task reached deadline
//     setInterval(() => {
//       if (this.taskDetail) {
//         if (this.taskDetail) {
//           this.deadlineTask = this.reachedDeadline(new Date(), new Date(this.taskDetail.deadline));
//         }
//       }
//     }, 1000);
//
//     this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
  }
//
//   private externalInfoPoller(task: CourseTask, step: number) {
//     if (step > 10) {
//       this.snackbar.open('Leider konnte keine externe Aufgabenstellung geladen werden.', 'OK', {duration: 5000});
//       return;
//     }
//     this.db.getTaskResult(task.task_id).toPromise()
//       .then((loadedTask: CourseTask) => {
//         if (loadedTask.external_description != null) {
//           this.taskDetail = loadedTask;
//           if (this.externalInfoIsForm(loadedTask)) { this.submissionAsFile = 'choice'; }
//         } else {
//           setTimeout(() => {
//             this.externalInfoPoller(task, step + 1);
//           }, 5000);
//         }
//       });
//   }
//
//   externalInfoIsForm(task: CourseTask) {
//     if (!task.load_external_description || !task.external_description) {
//       return false;
//     } else {
//       try {
//         return JSON.parse(task.external_description);
//       } catch (e) {
//         return false;
//       }
//
//     }
//
//   }
//
//   public triggerExternalDescriptionIfNeeded(task: CourseTask, force: Boolean) {
//     if (force) {
//       task.external_description = '';
//     }
//     if (task.load_external_description && task.external_description == null || force) {
//       this.db.triggerExternalInfo(task.task_id, task.testsystems[0].testsystem_id).toPromise().then(() => {
//         this.externalInfoPoller(task, 0);
//       }).catch(() => {
//         this.snackbar.open('Leider konnte keine externe Aufgabenstellung geladen werden.', 'OK', {duration: 5000});
//       });
//     }
//
//   }
//
//   onResize(event) {
//     this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
//   }
//
//   private loadCourseDetailsTasks() {
//     this.db.getCourseDetailOfTask(this.courseID, this.taskID).toPromise()
//       .then(course_detail => {
//         this.taskDetail = course_detail.task;
//       });
//   }
//
//   private loadCourseDetails() {
//     this.db.getCourseDetailOfTask(this.courseID, this.taskID).toPromise()
//       .then(course_detail => {
//         this.courseDetail = course_detail;
//       });
//   }
//
//   public openSettings() {
//     if (this.isAuthorized()) {
//       this.dialog.open(ParameterCourseModalComponent, {data: {courseid: this.courseID}});
//     } else {
//       this.dialog.open(ParameterUserModalComponent, {data: {courseid: this.courseID}});
//     }
//   }
//
//   public plagiatModule(courseDetail: DetailedCourseInformation) {
//     this.dialog.open(PlagiatScriptUploadComponent, { data: {courseid: this.courseID}}).afterClosed()
//       .toPromise()
//       .then((close) => {
//         if (close) {
//           this.loadCourseDetails();
//         }
//       });
//   }
//
//   public deleteCourse(courseDetail: DetailedCourseInformation) {
//     this.dialog.open(DeleteCourseModalComponent, {
//       data: {coursename: courseDetail.course_name, courseID: courseDetail.course_id}
//     }).afterClosed().pipe(
//       flatMap(value => {
//         if (value.exit) {
//           return this.db.deleteCourse(courseDetail.course_id);
//         }
//       })
//     )
//       .toPromise()
//       .then( (value: Succeeded) => {
//         if (typeof value == 'undefined') {
//           return ;
//         }
//         if (value.success) {
//           this.snackbar.open('Kurs mit der ID ' + courseDetail.course_id + ' wurde gelöscht', 'OK', {duration: 5000});
//         } else {
//           this.snackbar.open('Leider konnte der Kurs ' + courseDetail.course_id + ' nicht gelöscht werden. Dieser Kurs scheint nicht zu existieren.', 'OK', {duration: 5000});
//         }
//       })
//       .catch(() => {
//         this.snackbar.open('Leider konnte der Kurs ' + courseDetail.course_id + ' nicht gelöscht werden. Wahrscheinlich hast du keine Berechtigung', 'OK', {duration: 5000});
//       })
//       .then(() => {
//         this.router.navigate(['courses']);
//       });
//   }
//
//   public isAuthorized() {
//     return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor';
//   }
//
//   public runAllTaskAllUsers(taskid: number) {
//     this.db.runAllCourseTaskByDocent(this.courseID, taskid);
//   }
//
//   reRunTask(task: CourseTask) {
//     this.submissionData = task.submission_data;
//     this.submitTask(task);
//   }
//
//   public isInFetchingResultOfTasks(task: CourseTask) {
//     const tasksystemPassed = task.evaluation
//       .map( (eva: CourseTaskEvaluation) => eva.passed );
//     const tasksystemNulls = tasksystemPassed.filter(passed => {
//       return (passed == null || typeof passed === undefined);
//     });
//     if (tasksystemPassed.indexOf(false) >= 0) {
//       return false;
//     } else {
//       return tasksystemNulls.length > 0;
//     }
//   }
//
//   private submitTask(currentTask: CourseTask) {
//     this.processing = true;
//     this.taskDetail.submission_data = '';
//     this.db.submitTask(currentTask.task_id, this.submissionData).subscribe(res => {
//       this.submissionData = '';
//
//       if (res.success) {
//         this.db.getTaskResult(currentTask.task_id).pipe(
//           flatMap(taskResult => {
//
//             this.taskDetail = taskResult;
//
//             if (this.isInFetchingResultOfTasks(taskResult)) {
//               return throwError('No result yet');
//             }
//             return of(taskResult);
//           }),
//           retryWhen(errors => errors.pipe(
//             delay(5000),
//             take(120)))
//         ).subscribe(taskResult => {
//           this.processing = false;
//           this.taskDetail = taskResult;
//         });
//
//       }
//     });
//   }
//
//   /**
//    * Opens dialog for creation of new task
//    * @param course The course data for dialog
//    */
//   createTask(course: DetailedCourseInformation) {
//     this.dialog.open(TaskNewDialogComponent, {
//       height: 'auto',
//       width: 'auto',
//       data: {courseID: course.course_id}
//     }).afterClosed().pipe(
//       flatMap((value) => {
//         if (value.success) {
//           this.snackbar.open('Erstellung der Aufgabe erfolgreich', 'OK', {duration: 3000});
//           this.waitAndDisplayTestsystemAcceptanceMessage(value.taskid);
//         }
//         return this.db.getCourseDetailOfTask(course.course_id, this.taskID);
//       })
//     ).subscribe(course_detail => {
//       this.taskDetail = course_detail.task;
//
//       if (typeof this.submissionAsFile == 'undefined') {
//         if (this.externalInfoIsForm(this.taskDetail)) {
//           this.submissionAsFile = 'choice';
//         } else {
//           this.submissionAsFile = 'text';
//         }
//       }
//
//
//     });
//   }
//
//
//
//   private waitAndDisplayTestsystemAcceptanceMessage(taskid: number) {
//     setTimeout(() => {
//       this.db.getTaskResult(taskid).pipe(
//         flatMap((taskResult: NewTaskInformation) => {
//           const acceptance_flaggs = (taskResult.testsystems.map(t => t.test_file_accept));
//
//           if (acceptance_flaggs.indexOf(null) < 0) {
//             this.dialog.open(TestsystemAnswerDialogComponent, {data: taskResult});
//             return of({success: true});
//           } else {
//             return throwError('Not all results yet');
//           }
//         }),
//         retryWhen(errors => errors.pipe(
//           delay(5000),
//           take(50)))
//       ).toPromise()
//         .then(d => {
//           if (typeof d == 'undefined') {
//             this.dialog.open(TestsystemAnswerDialogComponent, {data: {no_reaction: true}});
//           }
//         })
//         .catch((e) => {
//
//         });
//     }, 2000);
//   }
//
//   displayTestsystemFeedback(task) {
//     this.db.getTaskResult(task.task_id).toPromise()
//       .then((data: NewTaskInformation) => {
//         this.dialog.open(TestsystemAnswerDialogComponent, {data: data});
//       }).catch(() => {
//
//     });
//   }
//
//   /**
//    * Opens dialog to update task
//    * @param task The task to update
//    */
//   updateTask(task: CourseTask) {
//     this.dialog.open(TaskNewDialogComponent, {
//       height: 'auto',
//       width: 'auto',
//       data: {
//         task: task
//       }
//     }).afterClosed().pipe(
//       flatMap((value: SucceededUpdateTask) => {
//         if (value.success) {
//           this.snackbar.open('Update der Aufgabe ' + task.task_name + ' erfolgreich', 'OK', {duration: 3000});
//           this.waitAndDisplayTestsystemAcceptanceMessage(task.task_id);
//
//         }
//         return this.db.getCourseDetailOfTask(this.courseDetail.course_id, this.taskID);
//       })
//     ).subscribe(course_detail => {
//       this.taskDetail = course_detail.task;
//     });
//   }
//
//   /**
//    * Opens snackbar and asks
//    * if docent/tutor really wants to delete
//    * this task
//    * @param task The task that will be deleted
//    */
//   deleteTask(task: CourseTask) {
//     this.dialog.open(TaskDeleteModalComponent, {
//       data: {taskname: task.task_name}
//     }).afterClosed().pipe(
//       flatMap(value => {
//         if (value.exit) {
//           return this.db.deleteTask(task.task_id); // TODO: Service
//         }
//       })
//     ).toPromise()
//       .then( (value: Succeeded) => {
//         if (value.success) {
//           this.snackbar.open('Aufgabe ' + task.task_name + ' wurde gelöscht', 'OK', {duration: 3000});
//           this.loadCourseDetailsTasks();
//         } else {
//           this.snackbar.open('Aufgabe ' + task.task_name + ' konnte nicht gelöscht werden', 'OK', {duration: 3000});
//         }
//       })
//       .catch((e) => {
//         this.snackbar.open('Es gab ein Datenbankfehler, Aufgabe ' + task.task_name + ' konnte nicht gelöscht werden', 'OK', {duration: 3000});
//       });
//   }
//
//   /**
//    * Get file user wants to submit
//    * @param file The file user submits
//    * @param currentTask The current task to get file from
//    */
//   getSubmissionFile(file: File, currentTask: CourseTask) {
//     this.submissionData = file;
//   }
//
//   updateSubmissionContent(payload: any) {
//     this.submissionData = payload['content'];
//   }
//
//   /**
//    * Submission of user solution
//    * @param courseID Current course
//    * @param currentTask The current task for submission
//    */
//   submission(courseID: number, currentTask: CourseTask) {
//     if (this.submissionData == null) {
//       this.snackbar.open('Sie haben keine Lösung für die Aufgabe ' + currentTask.task_name + ' abgegeben', 'Ups!');
//       return;
//     }
//
//     // if user submits but there is a pending submission
//     if (currentTask.submit_date && this.isInFetchingResultOfTasks(currentTask)) {
//       this.snackbar.open('Für Aufgabe "' + currentTask.task_name +
//         '" wird noch auf ein Ergebnis gewartet, trotzdem abgeben ?', 'Ja', {duration: 10000})
//         .onAction()
//         .subscribe(() => {
//           this.submitTask(currentTask);
//         });
//     } else {
//       this.submitTask(currentTask);
//     }
//   }
//
//
//
//   /**
//    * Opens dialog to update course information
//    */
//   updateCourse() {
//     this.dialog.open(CourseUpdateDialogComponent, {
//       height: '600px',
//       width: '800px',
//       data: {data: this.courseDetail}
//     }).afterClosed().subscribe((value: Succeeded) => {
//       location.hash = '';
//       if (value.success) {
//         this.db.getCourseDetailOfTask(this.courseID, this.taskID).subscribe(courses => {
//           this.courseDetail = courses;
//           this.titlebar.emitTitle(this.courseDetail.course_name);
//         });
//       }
//     });
//   }
//
//   /**
//    * If user gets course directly from link
//    */
//   subscribeCourse() {
//     this.db.subscribeCourse(this.courseID).pipe(
//       flatMap(success => {
//         if (success.success) {
//           this.snackbar.open('Kurs ' + this.courseDetail.course_name + ' beigetreten', 'OK', {duration: 3000});
//           return this.db.getCourseDetailOfTask(this.courseID, this.taskID);
//         }
//       })
//     ).subscribe(courseDetail => {
//       this.courseDetail = courseDetail;
//       this.taskDetail = courseDetail.task;
//     });
//   }
//
//   tabChanged(event: MatTabChangeEvent) {
//
//   }
//
//   isInRole(roles: string[]): Boolean {
//     return roles.indexOf(this.userRole) >= 0;
//   }
//
//   get plagiarism_script_status() {
//     return (this.courseDetail.plagiarism_script) ? 'primary' : 'warn';
//   }
}
