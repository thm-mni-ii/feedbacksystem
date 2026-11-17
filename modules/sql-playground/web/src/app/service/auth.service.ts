import { Inject, Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable, BehaviorSubject } from "rxjs";
import { I18NEXT_SERVICE, ITranslationService } from "angular-i18next";
import { JWTToken } from "../model/JWTToken";

const TOKEN_ID = "token";

/**
 * Manages login and logout of the user of the page.
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly tokenReceivedSubject = new BehaviorSubject<boolean>(false);
  public readonly tokenReceived$: Observable<boolean> = this.tokenReceivedSubject.asObservable();

  constructor(
    private jwtHelper: JwtHelperService,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {
    this.initTheme();
    if (this.isEmbedded()) {
      this.initPostMessageBridge();
    }
  }

  public initTheme(): void {
    if (typeof document === "undefined") return;
    const storedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("fbs_theme") : null;
    if (storedTheme === "dark" || (!storedTheme && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.body.classList.add("dark-theme");
    } else if (storedTheme === "light") {
      document.body.classList.remove("dark-theme");
    }
  }

  public applyTheme(theme: string): void {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("fbs_theme", theme);
    }
  }

  public isEmbedded(): boolean {
    return (
      typeof window !== "undefined" &&
      (window.self !== window.top ||
        window.location.search.includes("embedded=true"))
    );
  }

  public initPostMessageBridge(): void {
    if (typeof window === "undefined" || !window.parent) return;

    window.addEventListener("message", (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "FBS_AUTH_TOKEN_RESPONSE" && data.accessToken) {
        this.storeToken(data.accessToken);
      }
      if (data.type === "FBS_HANDSHAKE_ACK") {
        if (data.theme) {
          this.applyTheme(data.theme);
        }
        if (data.locale && this.i18NextService && typeof this.i18NextService.changeLanguage === "function") {
          const cleanLocale = data.locale === "en" ? "en" : "de";
          this.i18NextService.changeLanguage(cleanLocale).then(() => {});
        }
      }
      if (data.type === "FBS_THEME_CHANGED" && data.theme) {
        this.applyTheme(data.theme);
      }
      if (data.type === "FBS_LOCALE_CHANGED") {
        const locale = data.locale || data.payload?.locale;
        if (locale && this.i18NextService && typeof this.i18NextService.changeLanguage === "function") {
          const cleanLocale = locale === "en" ? "en" : "de";
          this.i18NextService.changeLanguage(cleanLocale).then(() => {});
        }
      }
    });

    try {
      window.parent.postMessage(
        {
          type: "FBS_INIT_HANDSHAKE",
          providerId: "sql-playground",
          version: "1.0",
        },
        "*"
      );
    } catch (e) {
      console.warn("Could not send FBS_INIT_HANDSHAKE:", e);
    }
  }

  /**
   * Logout user by removing its token.
   */
  public logout() {
    localStorage.removeItem(TOKEN_ID);
  }

  /**
   * Returns true only if a valid token exists.
   */
  public isAuthenticated(): boolean {
    const token = this.loadToken();
    return token && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * @return The lastly received token.
   */
  getToken(): JWTToken | null {
    const token = this.loadToken();
    if (!token) return null;
    const decodedToken: any = this.decodeToken();
    if (!decodedToken) return null;
    if (this.jwtHelper.isTokenExpired(token)) return null;

    let courseRoles: any = decodedToken.courseRoles || [];
    if (typeof courseRoles === "string") {
      try {
        courseRoles = JSON.parse(courseRoles);
      } catch (e) {
        courseRoles = [];
      }
    } else if (!Array.isArray(courseRoles) && typeof courseRoles !== "object") {
      courseRoles = [];
    }

    const id = decodedToken.id !== undefined ? Number(decodedToken.id) : (decodedToken.sub ? parseInt(decodedToken.sub, 10) : 0);
    const username = decodedToken.username ?? decodedToken.preferred_username ?? "";
    const globalRole = decodedToken.globalRole ?? decodedToken.global_role ?? "USER";

    return {
      ...decodedToken,
      id,
      username,
      globalRole,
      courseRoles,
    };
  }

  /**
   * Renews token taken from the http response.
   * @param response The http response.
   */
  public renewToken(response: HttpResponse<any>) {
    const token = this.extractTokenFromHeader(response);
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.storeToken(token);
    }
  }

  private decodeToken(): JWTToken | null {
    return this.jwtHelper.decodeToken(localStorage.getItem("token"));
  }

  private extractTokenFromHeader(response: HttpResponse<any>): string {
    const authHeader: string = response.headers.get("Authorization");
    return authHeader ? authHeader.replace("Bearer ", "") : null;
  }

  /**
   * @return Get token as string or null if no token exists.
   */
  public loadToken(): string {
    return localStorage.getItem(TOKEN_ID);
  }

  public storeToken(token: string): void {
    localStorage.setItem(TOKEN_ID, token);
    this.tokenReceivedSubject.next(true);
  }
}
