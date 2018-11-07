import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfessorRoutingModule } from './professor-routing.module';
import { ProfStartComponent } from './prof-start/prof-start.component';
import {MaterialComponentsModule} from "../material-components/material-components.module";

@NgModule({
  imports: [
    CommonModule,
    ProfessorRoutingModule,
    MaterialComponentsModule
  ],
  declarations: [ProfStartComponent]
})
export class ProfessorModule { }
