import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ModeratorRoutingModule} from './moderator-routing.module';
import {ModeratorStartComponent} from './moderator-start/moderator-start.component';
import {MaterialComponentsModule} from "../material-components/material-components.module";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    ModeratorRoutingModule,
    MaterialComponentsModule,
    FormsModule
  ],
  declarations: [ModeratorStartComponent]
})
export class ModeratorModule {
}
