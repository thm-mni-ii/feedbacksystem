import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfessorRoutingModule } from './professor-routing.module';
import { ProfStartComponent } from './prof-start/prof-start.component';

@NgModule({
  imports: [
    CommonModule,
    ProfessorRoutingModule
  ],
  declarations: [ProfStartComponent]
})
export class ProfessorModule { }
