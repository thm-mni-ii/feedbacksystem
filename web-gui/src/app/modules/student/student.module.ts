import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StudentRoutingModule} from './student-routing.module';
import {StudentStartComponent} from "./student-start/student-start.component";
import {MaterialComponentsModule} from "../material-components/material-components.module";
import {MatSnackBar} from "@angular/material";
import {CourseTableComponent} from './student-list/course-table/course-table.component';
import {StudentSearchComponent} from './student-search/student-search.component';
import {StudentCourseComponent} from './student-course/student-course.component';
import {StudentListComponent} from './student-list/student-list.component';
import {StudentCourseDialogComponent} from "./student-course/student-course-dialog/student-course-dialog.component";
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

/**
 * Module for everything student related.
 * Import components for student here.
 */
@NgModule({
  imports: [
    CommonModule,
    StudentRoutingModule,
    MaterialComponentsModule,
  ],
  declarations: [
    StudentStartComponent,
    CourseTableComponent,
    StudentSearchComponent,
    StudentCourseComponent,
    StudentListComponent,
    StudentCourseDialogComponent,
    StudentDashboardComponent
  ],
  entryComponents: [StudentCourseDialogComponent],
  providers: [MatSnackBar]
})
export class StudentModule {
}
