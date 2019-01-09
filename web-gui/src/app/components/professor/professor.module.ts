import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ProfessorRoutingModule} from './professor-routing.module';
import {ProfStartComponent} from './prof-start/prof-start.component';
import {MaterialComponentsModule} from "../../modules/material-components/material-components.module";
import {ProfCoursesComponent} from './prof-courses/prof-courses.component';
import {FormsModule} from "@angular/forms";
import {ProfDashboardComponent} from './prof-dashboard/prof-dashboard.component';
import {ProfNewTaskDialogComponent} from './prof-courses/prof-new-task-dialog/prof-new-task-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    ProfessorRoutingModule,
    MaterialComponentsModule,
    FormsModule
  ],
  entryComponents: [ProfNewTaskDialogComponent],
  declarations: [ProfStartComponent, ProfCoursesComponent, ProfDashboardComponent, ProfNewTaskDialogComponent, ProfNewTaskDialogComponent]
})
export class ProfessorModule {
}
