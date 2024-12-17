import { createAction, props } from "@ngrx/store";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { View } from "src/app/model/sql_playground/View";
import { Table } from "src/app/model/sql_playground/Table";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { BackendDefintion } from "../collab/backend.service";

export const changeActiveDbId = createAction(
  "[SQL Playground] Change Active DB Id",
  props<{ dbId: number }>()
);
export const updateScheme = createAction("[SQL Playground] Update Scheme");
export const updateSchemeSuccess = createAction(
  "[SQL Playground] Update Scheme Success",
  props<{
    tables: Table[];
    constraints: Constraint[];
    views: View[];
    routines: Routine[];
    triggers: Trigger[];
  }>()
);
export const updateSchemeFailure = createAction(
  "[SQL Playground] Update Scheme Failure",
  props<{ error: any }>()
);

export const submitStatement = createAction(
  "[SQL Playground] Submit Statement",
  props<{ statement: string }>()
);
export const submitStatementSuccess = createAction(
  "[SQL Playground] Submit Statement Success",
  props<{ resultset: any }>()
);
export const submitStatementFailure = createAction(
  "[SQL Playground] Submit Statement Failure",
  props<{ error: any }>()
);
export const setBackend = createAction(
  "[SQL Playground] SetBackend",
  props<{ backend: BackendDefintion }>()
);
