import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SqlPlaygroundComponent } from "./components/sql-playground.component";

const routes: Routes = [
  {
    path: "",
    component: SqlPlaygroundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SqlPlaygroundRoutingModule {}
