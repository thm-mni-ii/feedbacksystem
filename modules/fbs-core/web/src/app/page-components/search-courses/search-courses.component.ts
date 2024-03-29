import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { mergeMap, startWith } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { CourseService } from "../../service/course.service";
import { Course } from "../../model/Course";
import { Roles } from "../../model/Roles";
import { AuthService } from "../../service/auth.service";
import { CourseUpdateDialogComponent } from "../../dialogs/course-update-dialog/course-update-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {
  I18NEXT_SERVICE,
  I18NextPipe,
  ITranslationService,
} from "angular-i18next";

/**
 * Show all courses
 */
@Component({
  selector: "app-search-courses",
  templateUrl: "./search-courses.component.html",
  styleUrls: ["./search-courses.component.scss"],
})
export class SearchCoursesComponent implements OnInit {
  constructor(
    private courseService: CourseService,
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog,
    private titlebar: TitlebarService,
    private i18NextPipe: I18NextPipe,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();

  ngOnInit() {
    this.i18NextService.events.languageChanged.subscribe(() => {
      this.titlebar.emitTitle(
        this.i18NextPipe.transform("sidebar.label.searchCourses")
      );
    });
    this.courses = this.courseService.getCourseList();

    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(""),
      mergeMap((value) => this._filter(value))
    );
  }

  createCourse() {
    this.dialog
      .open(CourseUpdateDialogComponent, {
        height: "auto",
        width: "auto",
        data: { isUpdateDialog: false },
      })
      .afterClosed()
      .subscribe(
        (result) => {
          if (result.success) {
            setTimeout(() => {
              this.router.navigate(["/courses", result.course.id]);
            }, 100);
          }
        },
        (error) => console.error(error)
      );
  }

  public isAuthorized() {
    const globalRole = this.auth.getToken().globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole)
    );
  }

  /**
   * Navigates to subbed course
   * @param courseId The course to go to
   */
  goToCourse(courseId: number) {
    this.router.navigate(["courses", courseId]);
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
