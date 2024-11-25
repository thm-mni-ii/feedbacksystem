import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { of } from "rxjs";
import {
  catchError,
  map,
  mergeMap,
  withLatestFrom,
  retry,
} from "rxjs/operators";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { AuthService } from "src/app/service/auth.service";
import * as SqlPlaygroundActions from "./sql-playground.actions";
import { selectActiveDb } from "./sql-playground.selectors";

@Injectable()
export class SqlPlaygroundEffects {
  constructor(
    private actions$: Actions,
    private sqlPlaygroundService: SqlPlaygroundService,
    private authService: AuthService,
    private store: Store
  ) {}

  updateScheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlPlaygroundActions.updateScheme),
      withLatestFrom(this.store.pipe(select(selectActiveDb))),
      mergeMap(([, activeDb]) => {
        const token = this.authService.getToken();
        return this.sqlPlaygroundService.getTables(token.id, activeDb).pipe(
          mergeMap((tables) =>
            this.sqlPlaygroundService.getConstraints(token.id, activeDb).pipe(
              mergeMap((constraints) =>
                this.sqlPlaygroundService.getViews(token.id, activeDb).pipe(
                  mergeMap((views) =>
                    this.sqlPlaygroundService
                      .getRoutines(token.id, activeDb)
                      .pipe(
                        mergeMap((routines) =>
                          this.sqlPlaygroundService
                            .getTriggers(token.id, activeDb)
                            .pipe(
                              map((triggers) =>
                                SqlPlaygroundActions.updateSchemeSuccess({
                                  tables,
                                  constraints,
                                  views,
                                  routines,
                                  triggers,
                                })
                              )
                            )
                        )
                      )
                  )
                )
              )
            )
          ),
          catchError((error) =>
            of(SqlPlaygroundActions.updateSchemeFailure({ error }))
          )
        );
      })
    )
  );

  submitStatement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlPlaygroundActions.submitStatement),
      withLatestFrom(this.store.pipe(select(selectActiveDb))),
      mergeMap(([{ statement }, activeDb]) => {
        const token = this.authService.getToken();
        return this.sqlPlaygroundService
          .submitStatement(token.id, activeDb, statement)
          .pipe(
            mergeMap((result) =>
              this.sqlPlaygroundService
                .getResults(token.id, activeDb, result.id)
                .pipe(
                  retry(),
                  map((res) =>
                    SqlPlaygroundActions.submitStatementSuccess({
                      resultset: res,
                    })
                  ),
                  catchError((error) =>
                    of(SqlPlaygroundActions.submitStatementFailure({ error }))
                  )
                )
            ),
            catchError((error) =>
              of(SqlPlaygroundActions.submitStatementFailure({ error }))
            )
          );
      })
    )
  );
  /*
  // New Effect
  saveTabsToLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlPlaygroundActions.saveTabsToLocalStorage),
      mergeMap(({ tabs }) => {
        // Logic to save tabs to local storage
        try {
          localStorage.setItem('tabs', JSON.stringify(tabs));
          return of(SqlPlaygroundActions.saveTabsToLocalStorageSuccess({ tabs }));
        } catch (error) {
          return of(SqlPlaygroundActions.saveTabsToLocalStorageFailure({ error }));
        }
      })
    )
  );

  // Assuming a place to dispatch submissionToTaskSuccess
  someEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlPlaygroundActions.someAction),
      mergeMap((action) =>
        this.someService.someMethod(action).pipe(
          map((response) =>
            SqlPlaygroundActions.submissionToTaskSuccess({ taskId: response.taskId })
          ),
          catchError((error) =>
            of(SqlPlaygroundActions.someActionFailure({ error }))
          )
        )
      )
    )
  );*/
}
