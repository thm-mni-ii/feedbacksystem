import { Component, OnInit, Input, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { TitlebarService } from "../../service/titlebar.service";
import { Course } from "../../model/Course";
import { AuthService } from "../../service/auth.service";
import { mergeMap, startWith } from "rxjs/operators";
import { UntypedFormControl } from "@angular/forms";
import { CourseRegistrationService } from "../../service/course-registration.service";
import {
  I18NEXT_SERVICE,
  I18NextPipe,
  ITranslationService,
} from "angular-i18next";

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
    private i18NextPipe: I18NextPipe,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  userID: number;
  totalTasks: any = 0;
  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();

  ngOnInit() {
    this.i18NextService.events.languageChanged.subscribe(() => {
      this.titlebar.emitTitle(
        this.i18NextPipe.transform("sidebar.label.myCourses")
      );
    });
    const userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(userID);

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
