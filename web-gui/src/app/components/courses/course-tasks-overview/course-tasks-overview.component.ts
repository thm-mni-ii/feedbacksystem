import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DomSanitizer} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {CourseTask, DetailedCourseInformation} from "../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-course-tasks-overview',
  templateUrl: './course-tasks-overview.component.html',
  styleUrls: ['./course-tasks-overview.component.scss']
})
export class CourseTasksOverviewComponent implements OnInit {

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar, private sanitizer: DomSanitizer,
              private router: Router, @Inject(DOCUMENT) document) {
  }

  tasks: CourseTask[];
  courseID: number;
  ngOnInit() {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id
        this.loadTasksFromCourse(param.id)
      }
    )
  }

  loadTasksFromCourse(courseid: number) {
      this.db.getCourseDetail(courseid).subscribe((value: DetailedCourseInformation) => {
        this.tasks = value.tasks
      })
  }



}
