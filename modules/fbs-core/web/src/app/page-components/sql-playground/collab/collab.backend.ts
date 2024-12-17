import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  Backend,
  ChangeEvent,
  ResultTab,
  AwarenessState,
  BackendUser,
} from "./backend.service";
import { Observable } from "rxjs";
import {
  QueryTab,
  queryTabEquals,
} from "src/app/model/sql_playground/QueryTab";

export class CollaborativeBackend implements Backend {
  private provider: HocuspocusProvider;
  private yDoc: Y.Doc;
  private inputMap: Y.Map<QueryTab>;
  private resultMap: Y.Map<ResultTab>;
  private me: BackendUser;

  constructor(readonly id: string) {
    this.provider = new HocuspocusProvider({
      url: "ws://127.0.0.1:1234",
      name: "playground-" + id,
    });
    this.yDoc = this.provider.document;
    this.inputMap = this.yDoc.getMap("inputs");
    this.resultMap = this.yDoc.getMap("results");
    this.me = {
      id: crypto.randomUUID(),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };
    this.provider.awareness.setLocalStateField("user", this.me);
  }

  streamInputChanges(): Observable<ChangeEvent<QueryTab>> {
    return new Observable<ChangeEvent<QueryTab>>((observer) => {
      const handler = (event: Y.YMapEvent<QueryTab>) => {
        event.changes.keys.forEach((change, key) => {
          let changeEvent: ChangeEvent<QueryTab>;
          if (change.action === "add") {
            changeEvent = {
              event: "create",
              payload: this.inputMap.get(key) as QueryTab,
            };
          } else if (change.action === "update") {
            changeEvent = {
              event: "update",
              payload: {
                id: key,
                ...this.inputMap.get(key),
              },
            };
          } else if (change.action === "delete") {
            changeEvent = {
              event: "delete",
              id: key,
            };
          }
          observer.next(changeEvent);
        });
      };

      this.inputMap.observe(handler);

      return () => {
        this.inputMap.unobserve(handler);
      };
    });
  }

  streamResultChanges(): Observable<ChangeEvent<ResultTab>> {
    return new Observable<ChangeEvent<ResultTab>>((observer) => {
      const handler = (event: Y.YMapEvent<ResultTab>) => {
        event.changes.keys.forEach((change, key) => {
          let changeEvent: ChangeEvent<ResultTab>;
          if (change.action === "add") {
            changeEvent = {
              event: "create",
              payload: this.resultMap.get(key) as ResultTab,
            };
          } else if (change.action === "update") {
            changeEvent = {
              event: "update",
              payload: {
                id: key,
                ...this.resultMap.get(key),
              },
            };
          } else if (change.action === "delete") {
            changeEvent = {
              event: "delete",
              id: key,
            };
          }
          observer.next(changeEvent);
        });
      };

      this.resultMap.observe(handler);

      return () => {
        this.resultMap.unobserve(handler);
      };
    });
  }

  emitInputChange(event: ChangeEvent<QueryTab>): Observable<void> {
    return new Observable<void>((observer) => {
      this.yDoc.transact(() => {
        if (event.event === "create" || event.event === "update") {
          const currentState = this.inputMap.get(event.payload.id);
          if (!queryTabEquals(currentState, event.payload)) {
            this.inputMap.set(event.payload.id, event.payload as QueryTab);
          }
        } else if (event.event === "delete") {
          this.inputMap.delete(event.id);
        }
      });
      observer.next();
      observer.complete();
    });
  }

  emitResultChange(event: ChangeEvent<ResultTab>): Observable<void> {
    return new Observable<void>((observer) => {
      this.yDoc.transact(() => {
        if (event.event === "create" || event.event === "update") {
          this.resultMap.set(event.payload.id, event.payload as ResultTab);
        } else if (event.event === "delete") {
          this.resultMap.delete(event.id);
        }
      });
      observer.next();
      observer.complete();
    });
  }

  announceSelectedInput(id: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.provider.awareness.setLocalStateField("currentInputTab", id);

      observer.next();
      observer.complete();
    });
  }
  streamSelectedInputs(): Observable<AwarenessState[]> {
    return new Observable<AwarenessState[]>((observer) => {
      this.provider.awareness.on("change", () => {
        observer.next(
          Array.from(this.provider.awareness.getStates().values())
            .filter(({ user }) => user.id !== this.me.id)
            .map(({ user, currentInputTab }) => {
              return { user, stateId: currentInputTab };
            })
        );
      });
    });
  }
}
