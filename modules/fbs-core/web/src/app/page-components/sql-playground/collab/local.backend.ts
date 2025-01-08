import { from, Observable, of } from "rxjs";
import {
  Backend,
  ChangeEvent,
  ResultTab,
  AwarenessState,
} from "./backend.service";
import { QueryTab } from "../../../model/sql_playground/QueryTab";

export class LocalBackend implements Backend {
  streamInputChanges(): Observable<ChangeEvent<QueryTab>> {
    return from(
      this.loadLocalStorage().map(
        (qt) => ({ event: "create", payload: qt } as ChangeEvent<QueryTab>)
      )
    );
  }
  streamResultChanges(): Observable<ChangeEvent<ResultTab>> {
    return of();
  }
  emitInputChange(event: ChangeEvent<QueryTab>): Observable<void> {
    const currentState = this.loadLocalStorage();
    if (event.event === "create") {
      currentState.push(event.payload);
    } else if (event.event === "update") {
      for (const entry of currentState) {
        if (entry.id === event.payload.id) {
          Object.assign(entry, event.payload);
        }
      }
    } else if (event.event === "delete") {
      let i = 0;
      for (const entry of currentState) {
        if (entry.id === event.id) {
          currentState.splice(i, 1);
          break;
        }
        i++;
      }
    }
    localStorage.setItem("playground.tabs", JSON.stringify(currentState));
    return of();
  }
  emitResultChange(_event: ChangeEvent<ResultTab>): Observable<void> {
    return of();
  }
  announceSelectedInput(_id: string): Observable<void> {
    return of();
  }
  streamSelectedInputs(): Observable<AwarenessState[]> {
    return of();
  }

  private loadLocalStorage(): QueryTab[] {
    const loadedData = localStorage.getItem("playground.tabs");
    return JSON.parse(loadedData) ?? [];
  }
}
