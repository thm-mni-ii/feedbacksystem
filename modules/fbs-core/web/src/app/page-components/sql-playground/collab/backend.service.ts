import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
import { QueryTab } from "../../../model/sql_playground/QueryTab";
import { Store } from "@ngrx/store";
import { selectBackend } from "../state/sql-playground.selectors";
import { LocalBackend } from "./local.backend";
import { CollaborativeBackend } from "./collab.backend";
import * as SqlInputTabsActions from "../sql-input-tabs/state/sql-input-tabs.actions";
import {
  selectActiveTab,
  selectTabs as selectInputTabs,
} from "../sql-input-tabs/state/sql-input-tabs.selectors";
import { AuthService } from "../../../service/auth.service";
import { setDatabaseInformation } from "../state/sql-playground.actions";

export interface Identity<I> {
  id: I;
}

export interface Tab {
  id: string;
  title: string;
}

export interface ResultTab extends Tab {}

export type ChangeEvent<T extends Identity<I>, I = T["id"]> =
  | { event: "create"; payload: T }
  | { event: "update"; payload: Partial<T> & { id: I } }
  | { event: "delete"; id: I };

export type BackendUser = { id: string; color: string };

export type AwarenessState = { user: BackendUser; stateId: string };

export type DatabaseInformation = { id: number; name: string; owner: string };

export type BackendDefintion =
  | { type: "local" }
  | { type: "collaborative"; id: string; database?: DatabaseInformation };

export interface Backend {
  setMeta(databaseInformation: DatabaseInformation): Observable<void>;
  streamMetaChanges(): Observable<{ key: string; value: any }>;
  streamInputChanges(): Observable<ChangeEvent<QueryTab>>;
  streamResultChanges(): Observable<ChangeEvent<ResultTab>>;
  emitInputChange(event: ChangeEvent<QueryTab>): Observable<void>;
  emitResultChange(event: ChangeEvent<ResultTab>): Observable<void>;
  announceSelectedInput(id: string): Observable<void>;
  streamSelectedInputs(): Observable<AwarenessState[]>;
}

@Injectable({ providedIn: "root" })
export class BackendService {
  private i: number = 0;
  private currentBackend: Backend;
  private knowInputState: QueryTab[] = [];
  private currentType?: string;

  constructor(private store: Store, private authService: AuthService) {}

  private findTabIndex(tabs: any[], id: string): number {
    return tabs.findIndex((tab) => tab.id === id);
  }

  setupBackendHandler() {
    this.store.select(selectBackend).subscribe((backend) => {
      if (this.currentType === backend.type) return;
      this.currentType = backend.type;
      if (backend.type === "local") {
        this.currentBackend = new LocalBackend();
      } else if (backend.type === "collaborative") {
        this.currentBackend = new CollaborativeBackend(
          backend.id,
          this.authService.getToken().username,
          this.authService.loadToken()
        );
        this.currentBackend.streamMetaChanges().subscribe(({ key, value }) => {
          if (key === "database") {
            this.store.dispatch(
              setDatabaseInformation({ databaseInformation: value })
            );
          }
        });
        if (backend.database) this.currentBackend.setMeta(backend.database);
      }

      /*this.store.dispatch(SqlInputTabsActions.closeAllTabs());
      this.store.dispatch(DynamicResultTableActions.closeTab({ index: -1 })); // Close all tabs*/

      this.currentBackend.streamInputChanges().subscribe((change) => {
        /*if (this.i > 10) {
          return;
        }*/

        this.i++;
        this.store
          .select(selectInputTabs)
          .pipe(first())
          .subscribe((tabs) => {
            switch (change.event) {
              case "create":
                const existingIndex = this.findTabIndex(
                  tabs,
                  change.payload.id
                );
                if (existingIndex === -1) {
                  this.store.dispatch(
                    SqlInputTabsActions.addTab({ tab: change.payload })
                  );
                  this.knowInputState.push(change.payload);
                }
                break;
              case "update":
                const updateIndex = this.findTabIndex(tabs, change.payload.id);
                if (
                  updateIndex !== -1 &&
                  tabs[updateIndex].content !== change.payload.content
                ) {
                  this.store.dispatch(
                    SqlInputTabsActions.updateTabContent({
                      index: updateIndex,
                      content: change.payload.content,
                    })
                  );
                } else if (
                  updateIndex !== -1 &&
                  tabs[updateIndex].name !== change.payload.name
                ) {
                  this.store.dispatch(
                    SqlInputTabsActions.updateTabName({
                      index: updateIndex,
                      name: change.payload.name,
                    })
                  );
                }
                break;
              case "delete":
                const deleteIndex = this.findTabIndex(tabs, change.id);
                if (deleteIndex !== -1) {
                  this.store.dispatch(
                    SqlInputTabsActions.closeTab({ index: deleteIndex })
                  );
                  this.knowInputState = this.knowInputState.filter(
                    (tab) => tab.id !== change.id
                  );
                }
                break;
            }
          });
      });

      /*this.currentBackend.streamResultChanges().subscribe((change) => {
        this.store
          .select(selectResultTabs)
          .pipe(first())
          .subscribe((resultTabs) => {
            switch (change.event) {
              case "create":
                this.store.dispatch(DynamicResultTableActions.addTab());
                // Assuming the last added tab is the one we just created
                const newIndex = resultTabs.length;
                this.store.dispatch(
                  DynamicResultTableActions.updateResultset({
                    resultset: { ...change.payload, index: newIndex },
                  })
                );
                break;
              case "update":
                const updateIndex = this.findTabIndex(
                  resultTabs,
                  change.payload.id
                );
                if (
                  updateIndex !== -1 &&
                  resultTabs[updateIndex].resultset !== change.payload
                ) {
                  this.store.dispatch(
                    DynamicResultTableActions.updateResultset({
                      resultset: { ...change.payload, index: updateIndex },
                    })
                  );
                }
                break;
              case "delete":
                const deleteIndex = this.findTabIndex(resultTabs, change.id);
                if (deleteIndex !== -1) {
                  this.store.dispatch(
                    DynamicResultTableActions.closeTab({ index: deleteIndex })
                  );
                }
                break;
            }
          });
      });*/

      this.store.select(selectInputTabs).subscribe((inputTabs) => {
        inputTabs.forEach((tab) => {
          const known =
            this.knowInputState &&
            Boolean(
              this.knowInputState.find((knownTab) => knownTab.id === tab.id)
            );
          this.currentBackend
            .emitInputChange({
              event: known ? "update" : "create",
              payload: tab,
            })
            .subscribe(() => {});
        });
        if (this.knowInputState)
          this.knowInputState.forEach((knownTab) => {
            const exists = Boolean(
              inputTabs.find((tab) => tab.id === knownTab.id)
            );
            if (!exists)
              this.currentBackend
                .emitInputChange({
                  event: "delete",
                  id: knownTab.id,
                })
                .subscribe(() => {});
          });
        this.knowInputState = inputTabs;
      });

      this.store.select(selectActiveTab).subscribe((activeTab) => {
        if (activeTab)
          this.currentBackend
            .announceSelectedInput(activeTab.id)
            .subscribe(() => {});
      });

      this.currentBackend
        .streamSelectedInputs()
        .subscribe((awarenessStates) => {
          this.store.dispatch(
            SqlInputTabsActions.updateActiveTabUsers({ awarenessStates })
          );
        });

      setTimeout(() => {
        this.store
          .select(selectInputTabs)
          .pipe(first())
          .subscribe((inputTabs) => {
            if (inputTabs.length === 0)
              this.store.dispatch(SqlInputTabsActions.addTab({}));
          });
      }, 1000);

      /*this.store.select(selectResultTabs).subscribe((resultTabs) => {
        resultTabs.forEach((tab) => {
          this.currentBackend
            .emitResultChange({
              event: "update",
              payload: { id: tab.id, ...tab },
            })
            .subscribe(() => {});
        });
      });*/
    });
  }
}
