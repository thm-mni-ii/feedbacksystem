import { Inject, Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { I18NEXT_SERVICE, ITranslationService } from "angular-i18next";
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

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {
    this._isEmbedded =
      typeof window !== "undefined" &&
      (window.self !== window.top ||
        window.location.search.includes("embedded=true"));

    this.isEmbeddedSubject = new BehaviorSubject<boolean>(this._isEmbedded);
    this.isEmbedded$ = this.isEmbeddedSubject.asObservable();

    if (this._isEmbedded) {
      this.setupPostMessageListener();
      this.initHandshake();
      this.setupRouteListener();
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
          if (payload.locale) {
            this.applyLocale(payload.locale);
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

        case "FBS_LOCALE_CHANGED": {
          const locale = data.locale || data.payload?.locale;
          if (locale) {
            this.applyLocale(locale);
          }
          break;
        }

        default:
          break;
      }
    });
  }

  private setupRouteListener(): void {
    if (typeof window === "undefined" || !window.parent) {
      return;
    }

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        try {
          window.parent.postMessage(
            {
              type: "FBS_ROUTE_CHANGED",
              providerId: "course-management",
              path: event.urlAfterRedirects || event.url,
            },
            "*"
          );
        } catch (e) {
          console.warn("Could not postMessage FBS_ROUTE_CHANGED to parent:", e);
        }
      });
  }

  private applyLocale(locale: string): void {
    const cleanLocale = locale === "en" ? "en" : "de";
    if (
      this.i18NextService &&
      typeof this.i18NextService.changeLanguage === "function"
    ) {
      this.i18NextService.changeLanguage(cleanLocale).then(() => {});
    }
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
