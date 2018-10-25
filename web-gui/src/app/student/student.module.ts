import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StudentRoutingModule} from './student-routing.module';
import {StudentStartComponent} from "./student-start/student-start.component";
import {MaterialComponentsModule} from "../material-components/material-components.module";
import {MatSnackBar} from "@angular/material";

@NgModule({
  imports: [
    CommonModule,
    StudentRoutingModule,
    MaterialComponentsModule
  ],
  declarations: [StudentStartComponent],
  providers:[MatSnackBar]
})
export class StudentModule {
}
