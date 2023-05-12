import { Component, OnInit, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import { TitlebarService } from "../../service/titlebar.service";
import { Course } from "../../model/Course";
import { AuthService } from "../../service/auth.service";
import { mergeMap, startWith } from "rxjs/operators";
import { UntypedFormControl } from "@angular/forms";
import { CourseRegistrationService } from "../../service/course-registration.service";
/**
 * Show all registered courses
 */
@Component({
  selector: "app-my-courses",
  templateUrl: "./my-courses.component.html",
  styleUrls: ["./my-courses.component.scss"],
})
export class MyCoursesComponent implements OnInit {
  @Input() data: Course;
  constructor(
    private titlebar: TitlebarService,
    private courseRegistrationService: CourseRegistrationService,
    private authService: AuthService,

  ) { }


  userID: number;
  totalTasks: any = 0;
  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();




  ngOnInit() {
    this.titlebar.emitTitle("Meine Kurse");
    this.userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(this.userID);
    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(""),
      mergeMap((value) => this._filter(value))
    );
  }

  private _filter(value: string): Observable<Course[]> {
    const filterValue = this._normalizeValue(value);
    return this.courses.pipe(
      mergeMap((courseList) => {
        if (filterValue.length > 0) {
          return of(
            courseList.filter((course) =>
              this._normalizeValue(course.name).includes(filterValue)
            )
          );
        } else {
          return this.courses;
        }
      })
    );
  }



  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }
}
