import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { OAuthService } from "angular-oauth2-oidc";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { JWTToken } from "../model/JWTToken";
import { authCodeFlowConfig } from "../auth.config";

const TOKEN_ID = "token";
const COURSE_ROLES_ID = "courseRoles";
const SERVER_TIME_OFFSET_ID = "serverTimeOffset";

/**
 * Manages login and logout of the user of the page using OIDC PKCE.
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private serverTimeAtSync: number = null;
  private clientTimeAtSync: number = null;
  private cachedCourseRoles: Record<string, string> = {};
  private courseRolesSubject = new BehaviorSubject<Record<string, string>>({});
  public courseRoles$ = this.courseRolesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private oauthService: OAuthService
  ) {
    this.cachedCourseRoles = this.loadStoredCourseRoles();
    this.courseRolesSubject.next(this.cachedCourseRoles);
    this.configure();
  }

  private configure() {
    this.oauthService.configure(authCodeFlowConfig);
    const isEmbedded =
      typeof window !== "undefined" &&
      (window.self !== window.top ||
        window.location.search.includes("embedded=true"));
    if (!isEmbedded) {
      this.oauthService.setupAutomaticSilentRefresh();
    }
  }

  public async tryLogin(): Promise<boolean> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    } catch (e) {
      // Ignore discovery or login errors
    }
    return this.isAuthenticated();
  }

  public login() {
    this.oauthService.initCodeFlow();
  }

  public logout() {
    localStorage.removeItem(TOKEN_ID);
    localStorage.removeItem(COURSE_ROLES_ID);
    this.cachedCourseRoles = {};
    this.courseRolesSubject.next({});
    this.oauthService.logOut();
  }

  public isAuthenticated(): boolean {
    if (this.oauthService.hasValidAccessToken()) {
      return true;
    }
    const token = this.loadToken();
    if (!token) {
      return false;
    }
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch {
      return false;
    }
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken() || this.loadToken() || "";
  }

  public getIdentityClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  private loadStoredCourseRoles(): Record<string, string> {
    try {
      const stored = localStorage.getItem(COURSE_ROLES_ID);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }
    return {};
  }

  public fetchCourseRoles(uid?: number): Observable<Record<string, string>> {
    let userId = uid;
    if (!userId) {
      try {
        userId = this.getToken()?.id;
      } catch {
        // ignore
      }
    }
    if (!userId) {
      return of(this.loadStoredCourseRoles());
    }
    return this.http
      .get<Record<string, string>>(`/api/v1/users/${userId}/course-roles`)
      .pipe(
        tap((roles) => {
          this.cachedCourseRoles = roles || {};
          try {
            localStorage.setItem(
              COURSE_ROLES_ID,
              JSON.stringify(this.cachedCourseRoles)
            );
          } catch {
            // ignore
          }
          this.courseRolesSubject.next(this.cachedCourseRoles);
        }),
        catchError((err) => {
          console.warn("Could not fetch course roles:", err);
          return of(this.loadStoredCourseRoles());
        })
      );
  }

  public setCourseRole(courseId: number | string, role: string): void {
    this.cachedCourseRoles = {
      ...this.cachedCourseRoles,
      [courseId.toString()]: role,
    };
    try {
      localStorage.setItem(
        COURSE_ROLES_ID,
        JSON.stringify(this.cachedCourseRoles)
      );
    } catch {
      // ignore
    }
    this.courseRolesSubject.next(this.cachedCourseRoles);
  }

  public removeCourseRole(courseId: number | string): void {
    const nextRoles = { ...this.cachedCourseRoles };
    delete nextRoles[courseId.toString()];
    this.cachedCourseRoles = nextRoles;
    try {
      localStorage.setItem(
        COURSE_ROLES_ID,
        JSON.stringify(this.cachedCourseRoles)
      );
    } catch {
      // ignore
    }
    this.courseRolesSubject.next(this.cachedCourseRoles);
  }

  /**
   * @return The decoded token object.
   */
  getToken(): JWTToken {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error("No token found");
    }
    const claims: any = this.oauthService.getIdentityClaims() || {};
    let decodedToken: any = null;
    try {
      decodedToken = this.jwtHelper.decodeToken(token) || {};
    } catch (e) {
      decodedToken = {};
    }
    const merged = { ...claims, ...decodedToken };
    const id = merged.sub ? parseInt(merged.sub, 10) : merged.id;
    const storedRoles = this.loadStoredCourseRoles();
    let courseRoles: any = {
      ...storedRoles,
      ...this.cachedCourseRoles,
    };
    if (merged.courseRoles) {
      let tokenCourseRoles = merged.courseRoles;
      if (typeof tokenCourseRoles === "string") {
        try {
          tokenCourseRoles = JSON.parse(tokenCourseRoles);
        } catch (e) {
          tokenCourseRoles = {};
        }
      }
      if (typeof tokenCourseRoles === "object" && tokenCourseRoles !== null) {
        courseRoles = { ...courseRoles, ...tokenCourseRoles };
      }
    }
    return {
      id: id,
      username: merged.username || merged.preferred_username || "",
      globalRole: merged.globalRole,
      courseRoles: courseRoles,
      iat: merged.iat,
      exp: merged.exp,
    };
  }

  /**
   * Use the cas authentication method
   */
  public casLogin(): Observable<JWTToken> {
    this.login();
    return of(null);
  }

  /**
   * Use the ldap authentication method of the server to login via user name and password
   */
  public ldapLogin(username: string, password: string): Observable<JWTToken> {
    return this.loginLegacy(username, password, "/api/v1/login/ldap");
  }

  /**
   * Use the local authentication method of the server to login via user name and password
   */
  public localLogin(username: string, password: string): Observable<JWTToken> {
    return this.loginLegacy(username, password, "/api/v1/login/local");
  }

  /**
   * Use the unified local and ldap authentication method of the server to login via username and password
   */
  public unifiedLogin(
    username: string,
    password: string
  ): Observable<JWTToken> {
    return this.loginLegacy(username, password, "/api/v1/login/unified");
  }

  /**
   * Renews token taken from the http response.
   * @param response The http response.
   */
  public renewToken(response: HttpResponse<any>) {
    const syncedServerTime = this.syncServerTime(response);
    const token = this.extractTokenFromHeader(response);
    if (token && !syncedServerTime) {
      this.syncServerTimeFromToken(token);
    }

    if (token && !this.isTokenExpired(token)) {
      this.storeToken(token, false);
    }
  }

  private loginLegacy(
    username: string,
    password: string,
    uri: string
  ): Observable<JWTToken> {
    return this.http
      .post<any>(
        uri,
        { username: username, password: password },
        { observe: "response" }
      )
      .pipe(
        map((res) => {
          const syncedServerTime = this.syncServerTime(res);
          const token = this.extractTokenFromHeader(res);
          if (token && !syncedServerTime) {
            this.syncServerTimeFromToken(token);
          }
          return token;
        }),
        mergeMap((token) => {
          const decodedToken = this.jwtHelper.decodeToken(token);
          if (!decodedToken) {
            return throwError("Decoding the token failed");
          } else if (this.isTokenExpired(token)) {
            return throwError("Token expired");
          }
          this.storeToken(token, false);
          return of(this.getToken());
        })
      );
  }

  private extractTokenFromHeader(response: HttpResponse<any>): string {
    const authHeader: string = response.headers.get("Authorization");
    return authHeader ? authHeader.replace("Bearer ", "") : null;
  }

  /**
   * @return Get token as string or null if no token exists.
   */
  public loadToken(): string {
    return localStorage.getItem(TOKEN_ID) || this.oauthService.getAccessToken();
  }

  public storeToken(token: string, syncFromToken: boolean = false): void {
    localStorage.setItem(TOKEN_ID, token);
    if (syncFromToken) {
      this.syncServerTimeFromToken(token);
    }
  }

  public requestNewToken(): Observable<void> {
    return this.http.get("/api/v1/login/token", {}).pipe(map(() => null));
  }

  public startTokenAutoRefresh() {
    // With OIDC PKCE, automatic silent refresh is handled by angular-oauth2-oidc
  }

  private isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch {
      return true;
    }
  }

  private syncServerTime(response: HttpResponse<any>): boolean {
    const serverDate = response.headers.get("Date");
    if (!serverDate) {
      return false;
    }

    const serverTime = Date.parse(serverDate);
    if (Number.isNaN(serverTime)) {
      return false;
    }

    this.syncServerTimeAt(serverTime);
    return true;
  }

  private syncServerTimeFromToken(token: string): boolean {
    const decodedToken = this.jwtHelper.decodeToken(token);
    if (!decodedToken || !decodedToken.iat) {
      return false;
    }

    this.syncServerTimeAt(decodedToken.iat * 1000);
    return true;
  }

  private syncServerTimeAt(serverTime: number): void {
    this.serverTimeAtSync = serverTime;
    this.clientTimeAtSync = this.getClientTime();
    localStorage.setItem(SERVER_TIME_OFFSET_ID, `${serverTime - Date.now()}`);
  }

  private getCurrentServerTime(): number {
    if (this.serverTimeAtSync !== null && this.clientTimeAtSync !== null) {
      return (
        this.serverTimeAtSync + (this.getClientTime() - this.clientTimeAtSync)
      );
    }

    const storedOffset = Number(localStorage.getItem(SERVER_TIME_OFFSET_ID));
    return Number.isFinite(storedOffset)
      ? Date.now() + storedOffset
      : Date.now();
  }

  private getClientTime(): number {
    return typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  }
}
