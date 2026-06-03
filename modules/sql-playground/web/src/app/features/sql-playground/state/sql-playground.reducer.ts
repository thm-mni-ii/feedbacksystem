import { createReducer, on } from "@ngrx/store";
import * as SqlPlaygroundActions from "./sql-playground.actions";
import { Routine } from "src/app/model/sql_playground/Routine";
import { Trigger } from "src/app/model/sql_playground/Trigger";
import { View } from "src/app/model/sql_playground/View";
import { Table } from "src/app/model/sql_playground/Table";
import { Constraint } from "src/app/model/sql_playground/Constraint";
import { BackendDefintion } from "../collab/backend.service";

export interface SqlPlaygroundState {
  backend: BackendDefintion;
  activeDb: number;
  resultset: any;
  triggers: Trigger[];
  routines: Routine[];
  views: View[];
  tables: Table[];
  constraints: Constraint[];
  isQueryPending: boolean;
  error: any;
}

const initialState: SqlPlaygroundState = {
  backend: { type: "local" },
  activeDb: null,
  resultset: null,
  triggers: [],
  routines: [],
  views: [],
  tables: [],
  constraints: [],
  isQueryPending: false,
  error: null,
};

export const sqlPlaygroundReducer = createReducer(
  initialState,
  on(SqlPlaygroundActions.changeActiveDbId, (state, { dbId }) => ({
    ...state,
    activeDb: dbId,
  })),
  on(SqlPlaygroundActions.updateScheme, (state) => ({
    ...state,
    isQueryPending: true,
  })),
  on(
    SqlPlaygroundActions.updateSchemeSuccess,
    (state, { tables, constraints, views, routines, triggers }) => ({
      ...state,
      tables,
      constraints,
      views,
      routines,
      triggers,
      isQueryPending: false,
    })
  ),
  on(SqlPlaygroundActions.updateSchemeFailure, (state, { error }) => ({
    ...state,
    error,
    isQueryPending: false,
  })),
  on(SqlPlaygroundActions.submitStatement, (state) => ({
    ...state,
    isQueryPending: true,
  })),
  on(SqlPlaygroundActions.submitStatementSuccess, (state, { resultset }) => ({
    ...state,
    resultset,
    isQueryPending: false,
  })),
  on(SqlPlaygroundActions.submitStatementFailure, (state, { error }) => ({
    ...state,
    error,
    isQueryPending: false,
  })),
  on(SqlPlaygroundActions.setBackend, (state, { backend }) => ({
    ...state,
    backend,
  })),
  on(
    SqlPlaygroundActions.setDatabaseInformation,
    (state, { databaseInformation }) => ({
      ...state,
      backend: { ...state.backend, database: databaseInformation },
    })
  )
  /*
// New Handlers
on(SqlPlaygroundActions.saveTabsToLocalStorage, (state) => ({
  ...state,
  isQueryPending: true,
})),
on(SqlPlaygroundActions.saveTabsToLocalStorageSuccess, (state, { tabs }) => ({
  ...state,
  tabs,
  isQueryPending: false,
})),
on(
  SqlPlaygroundActions.saveTabsToLocalStorageFailure,
  (state, { error }) => ({
    ...state,
    error,
    isQueryPending: false,
  })
)*/
);
