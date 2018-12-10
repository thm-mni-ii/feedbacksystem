import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DatabaseService} from "../../../service/database.service";
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

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id'];
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Opens dialog for unsubscription
   */
  openDialog() {
    const dialogRef = this.dialog.open(StudentCourseDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.unsubscripeCourse();
      }
    });
  }


  /**
   * Unsubscribe user from course with :id
   */
  unsubscripeCourse() {
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


}
