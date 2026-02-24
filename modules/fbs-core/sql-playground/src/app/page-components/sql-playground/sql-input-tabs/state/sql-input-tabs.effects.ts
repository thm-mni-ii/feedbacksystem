import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  switchMap,
  map,
  withLatestFrom,
  takeWhile,
  repeat,
  catchError,
} from "rxjs/operators";
import * as SqlInputTabsActions from "./sql-input-tabs.actions";
import * as fromSqlInputTabs from "./sql-input-tabs.selectors";
import { of } from "rxjs";
import { AuthService } from "src/app/service/auth.service";
import { SubmissionService } from "src/app/service/submission.service";
import { CheckerService } from "src/app/service/checker.service";
import { PrismService } from "src/app/service/prism.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import * as SqlPlaygroundActions from "../../state/sql-playground.actions";

@Injectable()
export class SqlInputTabsEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private authService: AuthService,
    private submissionService: SubmissionService,
    private checkerService: CheckerService,
    private prismService: PrismService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  addTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.addTab),
      map(() => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  closeTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.closeTab),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  closeAllTabs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.closeAllTabs),
      map(() => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  updateTabContent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.updateTabContent),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  setActiveTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.setActiveTab),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  changeCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.changeCourse),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  changeTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.changeTask),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  /*loadTabsFromLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.loadTabsFromLocalStorage),
      switchMap(() => {
        console.log("load tabs");
        const loadedData = localStorage.getItem("tabs");
        const tabs = JSON.parse(loadedData)?.tabs ?? [];
        return [
          SqlInputTabsActions.loadTabsFromLocalStorageSuccess({
            tabs,
          }),
          ...(tabs.length === 0 ? [SqlInputTabsActions.addTab()] : []),
        ];
      })
    )
  );

  saveTabsToLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.saveTabsToLocalStorage),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectTabs)),
      map(([_, tabs]) => {
        const data = { tabs };
        localStorage.setItem("tabs", JSON.stringify(data));
        console.trace("save tabs");
        return SqlInputTabsActions.saveTabsToLocalStorageSuccess();
      })
    )
  );*/

  downloadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.downloadFile),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectActiveTab)),
      map(([{}, activeTab]) => {
        const file = new Blob([activeTab.content], { type: ".txt" });
        const a = document.createElement("a"),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = activeTab.name + ".txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
        return SqlInputTabsActions.downloadFileSuccess();
      })
    )
  );

  downloadAllFiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.downloadAllFiles),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectTabs)),
      map(([_, tabs]) => {
        for (let i = 0; i < tabs.length; i++) {
          const file = new Blob([tabs[i].content], { type: ".txt" });
          const a = document.createElement("a"),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = tabs[i].name + ".txt";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 200);
        }
        return SqlInputTabsActions.downloadAllFilesSuccess();
      })
    )
  );

  submission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.submission),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectActiveTab)),
      switchMap(([{}, activeTab]) => {
        if (!activeTab.content) {
          this.snackbar.open("Sie haben keine Lösung abgegeben", "Ups!");
          return of(SqlInputTabsActions.submissionFailure());
        }
        return of(
          SqlPlaygroundActions.submitStatement({
            statement: activeTab.content,
          }),
          SqlInputTabsActions.submissionSuccess()
        );
      })
    )
  );

  submissionToTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.submissionToTask),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectActiveTab)),
      switchMap(([{ index }, activeTab]) => {
        this.store.dispatch(SqlInputTabsActions.setPending({ pending: true }));
        const token = this.authService.getToken();
        return this.checkerService
          .getChecker(activeTab.selectedCourse.id, activeTab.selectedTask.id)
          .pipe(
            switchMap((checkerConfigs) => {
              const stagedEnabled =
                activeTab.selectedTask?.stagedFeedbackEnabled;
              const stagedLimit =
                activeTab.selectedTask?.stagedFeedbackLimit ?? 1;
              const initialOrders =
                stagedEnabled && checkerConfigs.length > 0
                  ? checkerConfigs
                      .filter((c) => c.ord <= stagedLimit)
                      .map((c) => c.ord)
                  : undefined;
              return this.submissionService.submitSolution(
                token.id,
                activeTab.selectedCourse.id,
                activeTab.selectedTask.id,
                this.cleanUpTextAreaRegx(activeTab.content),
                undefined,
                initialOrders
              );
            })
          )
          .pipe(
            switchMap((subResult) => {
              this.snackbar.open("Deine Abgabe wird ausgewertet.", "OK", {
                duration: 3000,
              });
              this.store.dispatch(
                SqlInputTabsActions.setSubmissionData({
                  submissionId: subResult.id,
                  results: subResult.results || [],
                })
              );
              this.store.dispatch(
                SqlInputTabsActions.waitForSubDone({ index, sid: subResult.id })
              );
              return of(
                SqlInputTabsActions.submissionToTaskSuccess({
                  taskId: activeTab.selectedTask.id,
                })
              );
            }),
            catchError((error) => {
              console.error(error);
              this.snackbar.open(
                "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
                "OK",
                { duration: 3000 }
              );
              this.store.dispatch(
                SqlInputTabsActions.setPending({ pending: false })
              );
              return of(SqlInputTabsActions.submissionToTaskFailure());
            })
          );
      })
    )
  );

  waitForSubDone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.waitForSubDone),
      withLatestFrom(this.store.select(fromSqlInputTabs.selectActiveTab)),
      switchMap(([{ sid }, activeTab]) => {
        const token = this.authService.getToken();
        return this.submissionService
          .getSubmission(
            token.id,
            activeTab.selectedCourse.id,
            activeTab.selectedTask.id,
            sid
          )
          .pipe(
            repeat(),
            takeWhile((sub) => !sub.done, true),
            switchMap((res) => {
              if (res.done) {
                console.log(
                  "waitForSubDone - Submission fertig, ID:",
                  res.id,
                  "Results:",
                  res.results
                );
                this.store.dispatch(
                  SqlInputTabsActions.setPending({ pending: false })
                );
                const hasFailure = res.results.some((r) => r.exitCode !== 0);
                this.store.dispatch(
                  SqlInputTabsActions.setSubmissionData({
                    submissionId: res.id,
                    results: res.results,
                  })
                );

                // Hole ALLE Submissions um everCorrect korrekt zu berechnen
                const token = this.authService.getToken();
                return this.submissionService
                  .getAllSubmissions(
                    token.id,
                    activeTab.selectedCourse.id,
                    activeTab.selectedTask.id
                  )
                  .pipe(
                    switchMap((allSubs) => {
                      console.log(
                        "waitForSubDone - Alle Submissions:",
                        allSubs.map((s: any) => ({
                          id: s.id,
                          time: s.submissionTime,
                        }))
                      );
                      // Prüfe ob irgendeine Submission jemals ALLE Checks bestanden hat
                      const everCorrect = allSubs.some((s: any) => {
                        const subResults = s.results || [];
                        return (
                          subResults.length > 0 &&
                          subResults.every((r: any) => r.exitCode === 0)
                        );
                      });

                      if (!hasFailure) {
                        this.store.dispatch(
                          SqlInputTabsActions.setSubmissionResult({
                            isCorrect: true,
                            error: false,
                            errorMsg: null,
                            everCorrect: true,
                          })
                        );
                      } else {
                        this.store.dispatch(
                          SqlInputTabsActions.setSubmissionResult({
                            isCorrect: false,
                            error: true,
                            errorMsg:
                              res.results.find((r) => r.exitCode !== 0)
                                ?.resultText || res.results[0]?.resultText,
                            everCorrect: everCorrect,
                          })
                        );
                      }
                      return of(SqlInputTabsActions.waitForSubDoneSuccess());
                    })
                  );
              }
              return of(SqlInputTabsActions.waitForSubDoneSuccess());
            }),
            catchError((error) => {
              console.error(error);
              return of(SqlInputTabsActions.waitForSubDoneFailure());
            })
          );
      })
    )
  );

  updateMode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SqlInputTabsActions.updateMode),
      map(({}) => {
        return SqlInputTabsActions.saveTabsToLocalStorage();
      })
    )
  );

  private cleanUpTextAreaRegx(sqlInput: String) {
    return sqlInput.trim().replace(/\s+/g, " ");
  }
}
