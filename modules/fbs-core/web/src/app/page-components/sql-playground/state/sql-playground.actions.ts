import { createAction, props } from "@ngrx/store";
import { Routine } from "src/app/features/sql-playground/models/Routine";
import { Trigger } from "src/app/features/sql-playground/models/Trigger";
import { View } from "src/app/features/sql-playground/models/View";
import { Table } from "src/app/features/sql-playground/models/Table";
import { Constraint } from "src/app/features/sql-playground/models/Constraint";
import {
  BackendDefintion,
  DatabaseInformation,
} from "../collab/backend.service";

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
  "[SQL Playground] Set Backend",
  props<{ backend: BackendDefintion }>()
);
export const setDatabaseInformation = createAction(
  "[SQL Playground] Set Backend database information",
  props<{ databaseInformation?: DatabaseInformation }>()
);
