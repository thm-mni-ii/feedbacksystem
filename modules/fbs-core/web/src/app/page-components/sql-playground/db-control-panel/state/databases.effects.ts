import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap } from "rxjs/operators";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  loadDatabases,
  loadDatabasesSuccess,
  loadDatabasesFailure,
  createDatabase,
  createDatabaseSuccess,
  createDatabaseFailure,
  deleteDatabase,
  deleteDatabaseSuccess,
  deleteDatabaseFailure,
  activateDatabase,
  activateDatabaseSuccess,
  activateDatabaseFailure,
} from "./databases.actions";
import { AuthService } from "../../../../service/auth.service";
import { JWTToken } from "../../../../model/JWTToken";
import {
  changeActiveDbId,
  updateScheme,
} from "../../state/sql-playground.actions";

@Injectable()
export class DatabasesEffects {
  private token: JWTToken;
  constructor(
    private actions$: Actions,
    private sqlPlaygroundService: SqlPlaygroundService,
    private snackbar: MatSnackBar,
    authService: AuthService
  ) {
    this.token = authService.isAuthenticated() ? authService.getToken() : null;
  }

  loadDatabases$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDatabases),
      switchMap(() => {
        if (!this.token) return;
        return this.sqlPlaygroundService.getDatabases(this.token.id).pipe(
          switchMap((databases) => {
            if (databases.length == 0) {
              // create default database if none exists
              return of(createDatabase({ name: "Standard Datenbank" }));
            } else {
              const activeId =
                databases.find(({ active }) => active)?.id ?? databases[0]?.id;
              return of(
                loadDatabasesSuccess({ databases }),
                changeActiveDbId({ dbId: activeId }),
                updateScheme()
              );
            }
          }),
          catchError((error) => of(loadDatabasesFailure({ error })))
        );
      })
    )
  );

  createDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createDatabase),
      mergeMap((action) =>
        this.sqlPlaygroundService
          .createDatabase(this.token.id, action.name)
          .pipe(
            map((database) => {
              this.snackbar.open("Datenbank erfolgreich erstellt", "Ok", {
                duration: 3000,
              });
              return createDatabaseSuccess({ database });
            }),
            catchError((error) => of(createDatabaseFailure({ error })))
          )
      )
    )
  );

  deleteDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteDatabase),
      mergeMap((action) =>
        this.sqlPlaygroundService.deleteDatabase(this.token.id, action.id).pipe(
          map(() => {
            this.snackbar.open("Datenbank erfolgreich gelöscht", "Ok", {
              duration: 3000,
            });
            return deleteDatabaseSuccess({ id: action.id });
          }),
          catchError((error) => of(deleteDatabaseFailure({ error })))
        )
      )
    )
  );

  activateDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(activateDatabase),
      mergeMap((action) =>
        this.sqlPlaygroundService
          .activateDatabase(this.token.id, action.id)
          .pipe(
            switchMap(() => {
              this.snackbar.open("Datenbank erfolgreich aktiviert", "Ok", {
                duration: 3000,
              });
              return [
                activateDatabaseSuccess({ id: action.id }),
                changeActiveDbId({ dbId: action.id }),
                updateScheme(),
              ];
            }),
            catchError((error) => of(activateDatabaseFailure({ error })))
          )
      )
    )
  );
}
