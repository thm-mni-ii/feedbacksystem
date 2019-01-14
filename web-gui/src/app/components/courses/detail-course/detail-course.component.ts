import {Component, OnInit} from '@angular/core';
import {flatMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {TitlebarService} from '../../../service/titlebar.service';
import {CourseTask, DetailedCourseInformation} from '../../../interfaces/HttpInterfaces';
import {DatabaseService} from '../../../service/database.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewtaskDialogComponent} from './newtask-dialog/newtask-dialog.component';
import {UserService} from '../../../service/user.service';
import {ExitCourseComponent} from './exit-course/exit-course.component';

@Component({
  selector: 'app-detail-course',
  templateUrl: './detail-course.component.html',
  styleUrls: ['./detail-course.component.scss']
})
export class DetailCourseComponent implements OnInit {


  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router) {
  }

  courseDetail: DetailedCourseInformation;
  courseTasks: CourseTask[];
  submissionData: File | string;
  submissionText: string;
  processing: boolean;
  userRole: string;

  // exampleTasks: CourseTask[] = [{
  //   task_id: 1,
  //   task_name: 'Aufgabe 1',
  //   task_description: 'Das ist die erste Aufgabe',
  //   task_type: 'FILE',
  //   submit_date: new Date(1508330494000),
  //   exitcode: 0,
  //   result: '',
  //   submission_data: '',
  //   passed: 0,
  //   result_date: new Date(1508330494000),
  //   file: 'abgabe1.txt',
  // },
  //   {
  //     task_id: 3,
  //     task_name: 'Aufgabe 2',
  //     task_description: 'Das ist eine weitere Aufgaben beschreibung',
  //     task_type: 'TEXT',
  //     submit_date: new Date(1508440494000),
  //     exitcode: 0,
  //     result: '',
  //     submission_data: 'dasistmeinsubmissionstring',
  //     passed: 0,
  //     result_date: new Date(1508550494000),
  //     file: '',
  //   },
  //   {
  //     task_id: 3,
  //     task_name: 'Aufgabe 3',
  //     task_description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor' +
  //       ' invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo' +
  //       ' duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit' +
  //       ' amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt' +
  //       ' ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores' +
  //       ' et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
  //     task_type: 'FILE',
  //     submit_date: new Date(1508774394000),
  //     exitcode: 3,
  //     result: 'Hier steht eine Fehlermeldung',
  //     submission_data: '',
  //     passed: 1,
  //     result_date: new Date(1508399994000),
  //     file: 'abgabe3.txt',
  //   },
  // ];


  ngOnInit() {
    this.userRole = this.user.getUserRole();

    this.route.params.pipe(
      flatMap(params => {
        const id = +params['id'];
        return this.db.getCourseDetail(id);
      })
    ).subscribe(course_detail => {
      this.courseDetail = course_detail;
      this.courseTasks = course_detail.tasks;
      this.titlebar.emitTitle(course_detail.course_name);
    });
  }

  createTask(course: DetailedCourseInformation) {
    this.dialog.open(NewtaskDialogComponent, {
      height: '400px',
      width: '600px',
      data: {courseID: course.course_id}
    }).afterClosed()
      .subscribe(result => {
        console.log(result);
      });
  }

  getSubmissionFile(file: File) {
    this.submissionData = file;
  }


  submission(courseID: number, currentTask: CourseTask) {
    this.db.submitTask(currentTask.task_id, this.submissionData).pipe(
      flatMap(res => {
        if (res.success) {
          this.processing = true;
        }
        return this.db.getTaskResult(currentTask.task_id);
      })).subscribe(taskResult => {
      // TODO: Retry until passed not null
      const oldTask = this.courseTasks[this.courseTasks.indexOf(currentTask)];
      console.log(oldTask);
      console.log(taskResult);
    });
  }

  exitCourse(courseName: string, courseID: number) {
    this.dialog.open(ExitCourseComponent, {
      data: {coursename: courseName}
    }).afterClosed().pipe(
      flatMap(value => {
        console.log(value);
        if (value.exit) {
          return this.db.unsubscribeCourse(courseID);
        }
      })
    ).subscribe(res => {
      console.log(res);
      if (res.success) {
        this.snackbar.open('Du hast den Kurs ' + courseName + ' verlassen', 'OK', {duration: 3000});
        this.router.navigate(['courses', 'user']);
      }
    });
  }

}
