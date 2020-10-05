import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {TaskSubmission} from "../../model/HttpInterfaces";
import {MiscService} from "../../service/misc.service";
import {Course} from "../../model/Course";
import {User} from "../../model/User";
import {CourseService} from "../../service/course.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-course-preview',
  templateUrl: './course-preview.component.html',
  styleUrls: ['./course-preview.component.scss']
})
export class CoursePreviewComponent implements OnInit {
  @Input() data: Course;
  private course: Course;
  private docents$: Observable<User[]>;
  private role: String;

  constructor(private misc: MiscService, private courseService: CourseService,
              private router: Router,) {
  }

  ngOnInit() {
    this.course = this.data;
    this.docents$ = this.courseService.getDocents(this.course.id);
    this.courseService.getRoleOfUser(1, this.course.id).subscribe( // TODO: user id from cookie
      response => this.role=response
    );
  }

  /**
   * Show course in detail
   * @param courseID The course to see in detail
   */
  goToCourse(courseID: number) {
    this.router.navigate(['courses', 136]); // TODO: Should be ID
  }
}
