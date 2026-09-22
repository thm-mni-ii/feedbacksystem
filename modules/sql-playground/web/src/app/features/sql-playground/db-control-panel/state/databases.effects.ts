import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap } from "rxjs/operators";
import { SqlPlaygroundService } from "src/app/service/sql-playground.service";
import { MongoPlaygroundService } from "src/app/service/mongo-playground.service";
import { MatSnackBar as MatSnackBar } from "@angular/material/snack-bar";
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
  resetMongoDatabase,
  resetMongoDatabaseSuccess,
  resetMongoDatabaseFailure,
} from "./databases.actions";
import { AuthService } from "../../../../service/auth.service";
import {
  changeActiveDbId,
  updateScheme,
} from "../../state/sql-playground.actions";

@Injectable()
export class DatabasesEffects {
  constructor(
    private actions$: Actions,
    private sqlPlaygroundService: SqlPlaygroundService,
    private mongoPlaygroundService: MongoPlaygroundService,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) {}

  loadDatabases$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDatabases),
      switchMap((action) => {
        const token = this.authService.getToken();
        if (!token) {
          return of(loadDatabasesFailure({ error: "No token available" }));
        }
        const userId = token.id;

        if (action.dbType === "postgres") {
          return this.sqlPlaygroundService.getDatabases(userId).pipe(
            switchMap((databases) => {
              if (databases.length === 0) {
                // create default database if none exists
                return of(
                  createDatabase({
                    name: "Standard Datenbank",
                    dbType: "postgres",
                  })
                );
              } else {
                const storedDbId = localStorage.getItem("playground-postgres-db");
                const parsedStoredId = storedDbId ? parseInt(storedDbId, 10) : null;
                const matchingStored = parsedStoredId !== null
                  ? databases.find((db) => db.id === parsedStoredId)
                  : null;

                const activeId =
                  matchingStored?.id ??
                  databases.find(({ active }) => active)?.id ??
                  databases[0]?.id;

                const updatedDatabases = databases.map((db) => ({
                  ...db,
                  active: db.id === activeId,
                }));

                if (activeId !== undefined) {
                  localStorage.setItem("playground-postgres-db", activeId.toString());
                }

                return [
                  loadDatabasesSuccess({ databases: updatedDatabases }),
                  activateDatabaseSuccess({ id: activeId }),
                  changeActiveDbId({ dbId: activeId as number }),
                  updateScheme(),
                ];
              }
            }),
            catchError((error) => of(loadDatabasesFailure({ error })))
          );
        } else if (action.dbType === "mongo") {
          return this.mongoPlaygroundService.getMongoDatabases(userId).pipe(
            map((mongoDbNames: string[]) => {
              const databases = mongoDbNames.map((name) => ({
                id: name,
                name: name,
                version: "",
                dbType: "MONGO",
                active: false,
              }));

              // Set the stored or first database as active
              const storedDbId = localStorage.getItem("playground-mongo-db");
              if (storedDbId && databases.length > 0) {
                const fullDbId = `mongo_playground_student_${userId}_${storedDbId}`;
                const dbIndex = databases.findIndex((db) => db.id === fullDbId || db.id === storedDbId);
                if (dbIndex >= 0) {
                  databases[dbIndex].active = true;
                } else {
                  databases[0].active = true;
                }
              } else if (databases.length > 0) {
                databases[0].active = true;
              }

              return loadDatabasesSuccess({ databases });
            }),
            catchError((error) => of(loadDatabasesFailure({ error })))
          );
        }

        return of(loadDatabasesFailure({ error: "Invalid dbType" }));
      })
    )
  );

  createDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createDatabase),
      mergeMap((action) => {
        const token = this.authService.getToken();
        if (!token) {
          return of(createDatabaseFailure({ error: "No token available" }));
        }
        const userId = token.id;

        if (action.dbType === "postgres") {
          return this.sqlPlaygroundService
            .createDatabase(userId, action.name)
            .pipe(
              switchMap((database) => {
                this.snackbar.open("Datenbank erfolgreich erstellt", "Ok", {
                  duration: 3000,
                });
                const dbWithActive = { ...database, active: true };
                localStorage.setItem("playground-postgres-db", database.id.toString());
                return [
                  createDatabaseSuccess({ database: dbWithActive }),
                  activateDatabaseSuccess({ id: database.id }),
                  changeActiveDbId({ dbId: database.id as number }),
                  updateScheme(),
                ];
              }),
              catchError((error) => of(createDatabaseFailure({ error })))
            );
        } else if (action.dbType === "mongo") {
          return this.mongoPlaygroundService
            .createMongoDatabase(userId, action.name)
            .pipe(
              switchMap(() => {
                this.snackbar.open("MongoDB erfolgreich erstellt", "Ok", {
                  duration: 3000,
                });
                const fullDbId = `mongo_playground_student_${userId}_${action.name}`;
                const database = {
                  id: fullDbId,
                  name: fullDbId,
                  version: "",
                  dbType: "MONGO",
                  active: true,
                };
                localStorage.setItem("playground-mongo-db", action.name);
                localStorage.setItem("playground-mongo-db-full", fullDbId);
                return [
                  createDatabaseSuccess({ database }),
                  activateDatabaseSuccess({ id: fullDbId }),
                ];
              }),
              catchError((error) => of(createDatabaseFailure({ error })))
            );
        }

        return of(createDatabaseFailure({ error: "Invalid dbType" }));
      })
    )
  );

  deleteDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteDatabase),
      mergeMap((action) => {
        const token = this.authService.getToken();
        if (!token || !token.id) {
          return of(deleteDatabaseFailure({ error: "No token available" }));
        }
        if (!action.id) {
          return of(deleteDatabaseFailure({ error: "No database ID provided" }));
        }
        const userId = token.id;

        if (action.dbType === "postgres") {
          return this.sqlPlaygroundService
            .deleteDatabase(userId, action.id as number)
            .pipe(
              map(() => {
                this.snackbar.open("Datenbank erfolgreich gelöscht", "Ok", {
                  duration: 3000,
                });
                return deleteDatabaseSuccess({ id: action.id });
              }),
              catchError((error) => of(deleteDatabaseFailure({ error })))
            );
        } else if (action.dbType === "mongo") {
          // Extract short name from full MongoDB name
          const shortName = (action.id as string).replace(
            /^mongo_playground_student_\d+_/,
            ""
          );
          return this.mongoPlaygroundService
            .deleteMongoDatabase(userId, shortName)
            .pipe(
              map(() => {
                this.snackbar.open("MongoDB erfolgreich gelöscht", "Ok", {
                  duration: 3000,
                });
                localStorage.removeItem("playground-mongo-db");
                return deleteDatabaseSuccess({ id: action.id });
              }),
              catchError((error) => of(deleteDatabaseFailure({ error })))
            );
        }

        return of(deleteDatabaseFailure({ error: "Invalid dbType" }));
      })
    )
  );

  activateDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(activateDatabase),
      mergeMap((action) => {
        const token = this.authService.getToken();
        if (!token || !token.id) {
          return of(activateDatabaseFailure({ error: "No token available" }));
        }
        if (!action.id) {
          return of(activateDatabaseFailure({ error: "No database ID provided" }));
        }
        const userId = token.id;

        if (action.dbType === "postgres") {
          return this.sqlPlaygroundService
            .activateDatabase(userId, action.id as number)
            .pipe(
              switchMap(() => {
                this.snackbar.open("Datenbank erfolgreich aktiviert", "Ok", {
                  duration: 3000,
                });
                localStorage.setItem("playground-postgres-db", action.id.toString());
                return [
                  activateDatabaseSuccess({ id: action.id }),
                  changeActiveDbId({ dbId: action.id as number }),
                  updateScheme(),
                ];
              }),
              catchError((error) => of(activateDatabaseFailure({ error })))
            );
        } else if (action.dbType === "mongo") {
          // For MongoDB, we just update the local state
          const shortName = (action.id as string).replace(
            /^mongo_playground_student_\d+_/,
            ""
          );
          localStorage.setItem("playground-mongo-db", shortName);
          localStorage.setItem("playground-mongo-db-full", action.id.toString());
          this.snackbar.open("MongoDB erfolgreich aktiviert", "Ok", {
            duration: 3000,
          });
          return of(activateDatabaseSuccess({ id: action.id }));
        }

        return of(activateDatabaseFailure({ error: "Invalid dbType" }));
      })
    )
  );

  resetMongoDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resetMongoDatabase),
      mergeMap((action) => {
        const token = this.authService.getToken();
        if (!token || !token.id) {
          return of(resetMongoDatabaseFailure({ error: "No token available" }));
        }
        if (!action.id) {
          return of(resetMongoDatabaseFailure({ error: "No database ID provided" }));
        }
        const userId = token.id;
        const shortName = action.id.replace(
          /^mongo_playground_student_\d+_/,
          ""
        );

        return this.mongoPlaygroundService
          .resetMongoDatabase(userId, shortName)
          .pipe(
            map(() => {
              this.snackbar.open("Die MongoDB wurde resettet.", "Ok", {
                duration: 3000,
              });
              return resetMongoDatabaseSuccess();
            }),
            catchError((error) => of(resetMongoDatabaseFailure({ error })))
          );
      })
    )
  );
}
