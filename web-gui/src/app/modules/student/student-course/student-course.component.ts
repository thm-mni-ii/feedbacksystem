import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CourseDetail, DatabaseService, Task} from "../../../service/database.service";
import {MatDialog} from "@angular/material";
import {StudentCourseDialogComponent} from "./student-course-dialog/student-course-dialog.component";
import {Subscription} from "rxjs";

/**
 * Component for showing a specific course and his tasks.
 * Students can submit solutions here.
 */
@Component({
  selector: 'app-student-course',
  templateUrl: './student-course.component.html',
  styleUrls: ['./student-course.component.scss']
})
export class StudentCourseComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private db: DatabaseService, private dialog: MatDialog,
              private router: Router) {
  }

  private sub: Subscription;
  id: number;
  course: CourseDetail;
  tasks: Task[];
  files: FileList;

  ngOnInit() {
    // Get id from URL
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id'];
    });

    // Get tasks for course with :id
    this.db.getCourseDetail(this.id).subscribe(course_detail => {
      //TODO: Fix undefined error
      this.course = course_detail;
      this.tasks = course_detail.tasks;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Opens dialog for unsubscription
   */
  openDialog() {
    const dialogRef = this.dialog.open(StudentCourseDialogComponent, {data: {name: this.course.course_name}});

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.unsubscripeCourse();
      }
    });
  }


  /**
   * Unsubscribe user from course with :id
   */
  private unsubscripeCourse() {
    const sub = this.db.unsubscribeCourse(this.id).subscribe(
      () => {
      },
      error1 => {
        console.log(error1)
      },
      () => {
        sub.unsubscribe();
        this.router.navigate(['user', 'courses']);
      });
  }


  // TODO: Use modal. Give user possibility to use Text.
  submitTask(task_id: number) {
    this.db.submitTask(task_id, this.files[0]).subscribe((a) => {
      console.log(a);
    });
  }

  getFile(event) {
    console.log(event.target.files);
    this.files = event.target.files;
  }

}
