import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthService } from "./auth.service";

export interface HandshakeAckPayload {
  theme?: "light" | "dark";
  locale?: string;
  hostOrigin?: string;
  providerId?: string;
}

@Injectable({
  providedIn: "root",
})
export class EmbeddingService {
  private readonly _isEmbedded: boolean;
  private readonly isEmbeddedSubject: BehaviorSubject<boolean>;
  public readonly isEmbedded$: Observable<boolean>;

  private readonly tokenReceivedSubject = new BehaviorSubject<boolean>(false);
  public readonly tokenReceived$ = this.tokenReceivedSubject.asObservable();

  private hostOrigin: string = "*";
  private currentTheme: "light" | "dark" = "light";

  constructor(private authService: AuthService) {
    this._isEmbedded =
      typeof window !== "undefined" &&
      (window.self !== window.top ||
        window.location.search.includes("embedded=true"));

    this.isEmbeddedSubject = new BehaviorSubject<boolean>(this._isEmbedded);
    this.isEmbedded$ = this.isEmbeddedSubject.asObservable();

    if (this._isEmbedded) {
      this.setupPostMessageListener();
      this.initHandshake();
    }
  }

  public get isEmbedded(): boolean {
    return this._isEmbedded;
  }

  public initHandshake(): void {
    if (!this._isEmbedded || typeof window === "undefined" || !window.parent) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          type: "FBS_INIT_HANDSHAKE",
          providerId: "course-management",
          version: "2.0",
        },
        "*"
      );
    } catch (e) {
      console.warn("Could not postMessage FBS_INIT_HANDSHAKE to parent:", e);
    }
  }

  public requestAuthToken(): void {
    if (!this._isEmbedded || typeof window === "undefined" || !window.parent) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          type: "FBS_REQUEST_AUTH_TOKEN",
        },
        "*"
      );
    } catch (e) {
      console.warn(
        "Could not postMessage FBS_REQUEST_AUTH_TOKEN to parent:",
        e
      );
    }
  }

  public navigateParent(path: string, external: boolean = false): void {
    if (!this._isEmbedded || typeof window === "undefined" || !window.parent) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          type: "FBS_NAVIGATE",
          path,
          external,
        },
        "*"
      );
    } catch (e) {
      console.warn("Could not postMessage FBS_NAVIGATE to parent:", e);
    }
  }

  public async waitForToken(timeoutMs: number = 2000): Promise<boolean> {
    if (!this._isEmbedded || this.authService.isAuthenticated()) {
      return true;
    }

    this.requestAuthToken();

    return new Promise<boolean>((resolve) => {
      let resolved = false;

      const sub = this.tokenReceived$.subscribe((received) => {
        if (received && this.authService.isAuthenticated()) {
          resolved = true;
          sub.unsubscribe();
          resolve(true);
        }
      });

      setTimeout(() => {
        if (!resolved) {
          sub.unsubscribe();
          resolve(this.authService.isAuthenticated());
        }
      }, timeoutMs);
    });
  }

  private setupPostMessageListener(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("message", (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }

      switch (data.type) {
        case "FBS_HANDSHAKE_ACK": {
          const payload = data as HandshakeAckPayload;
          if (payload.hostOrigin) {
            this.hostOrigin = payload.hostOrigin;
          }
          if (payload.theme) {
            this.applyTheme(payload.theme);
          }
          break;
        }

        case "FBS_AUTH_TOKEN_RESPONSE": {
          if (data.accessToken) {
            this.authService.storeToken(data.accessToken, true);
            this.tokenReceivedSubject.next(true);
          }
          break;
        }

        case "FBS_THEME_CHANGED": {
          if (data.theme) {
            this.applyTheme(data.theme);
          }
          break;
        }

        default:
          break;
      }
    });
  }

  private applyTheme(theme: "light" | "dark"): void {
    this.currentTheme = theme;
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
  }
}
