import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StudentRoutingModule} from './student-routing.module';
import {StudentStartComponent} from "./student-start/student-start.component";
import {MaterialComponentsModule} from "../material-components/material-components.module";
import {MatSnackBar} from "@angular/material";
import {CourseTableComponent} from './course-table/course-table.component';
import { StudentSearchComponent } from './student-search/student-search.component';
import { StudentCourseComponent } from './student-course/student-course.component';
import { StudentListComponent } from './student-list/student-list.component';

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
  declarations: [StudentStartComponent, CourseTableComponent, StudentSearchComponent, StudentCourseComponent, StudentListComponent],
  providers: [MatSnackBar]
})
export class StudentModule {
}
