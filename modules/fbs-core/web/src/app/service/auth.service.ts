import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable } from "rxjs";
import { of, throwError } from "rxjs";
import { mergeMap, map } from "rxjs/operators";
import { JWTToken } from "../model/JWTToken";

const TOKEN_ID = "token";
const SERVER_TIME_OFFSET_ID = "serverTimeOffset";

/**
 * Manages login and logout of the user of the page.
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private serverTimeAtSync: number = null;
  private clientTimeAtSync: number = null;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

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
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * @return The lastly received token.
   */
  getToken(): JWTToken {
    const token = this.loadToken();
    const decodedToken = this.decodeToken();
    if (!decodedToken) {
      throw new Error("Decoding the token failed");
    } else if (this.isTokenExpired(token)) {
      throw new Error("Token expired");
    }
    decodedToken.courseRoles = JSON.parse(<any>decodedToken.courseRoles);
    return decodedToken;
  }

  /**
   * Use the cas authentication method
   */
  public casLogin(): Observable<JWTToken> {
    return throwError("Not implemented yet!"); // TODO: impl cas login
  }

  /**
   * Use the ldap authentication method of the server to login via user name and password
   * @param username The username of a user
   * @param password The password of a user
   * @return Successful observable JWTToken, only if the token is valid.
   */
  public ldapLogin(username: string, password: string): Observable<JWTToken> {
    return this.login(username, password, "/api/v1/login/ldap");
  }

  /**
   * Use the local authentication method of the server to login via user name and password
   * @param username The username of a user
   * @param password The password of a user
   * @return Successful observable JWTToken, only if the token is valid.
   */
  public localLogin(username: string, password: string): Observable<JWTToken> {
    return this.login(username, password, "/api/v1/login/local");
  }

  /**
   * Use the unified local and ldap authentication method of the server to login via username and password
   * @param username The username of a user
   * @param password The password of a user
   * @return Successful observable JWTToken, only if the token is valid.
   */
  public unifiedLogin(
    username: string,
    password: string
  ): Observable<JWTToken> {
    return this.login(username, password, "/api/v1/login/unified");
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

  private login(
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
          const decodedToken = this.decodeToken(token);
          if (!decodedToken) {
            return throwError("Decoding the token failed");
          } else if (this.isTokenExpired(token)) {
            return throwError("Token expired");
          }
          this.storeToken(token, false);
          return of(decodedToken);
        })
      );
  }

  private decodeToken(token: string = this.loadToken()): JWTToken | null {
    return this.jwtHelper.decodeToken(token);
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

  public storeToken(token: string, syncFromToken: boolean = true): void {
    if (syncFromToken) {
      this.syncServerTimeFromToken(token);
    }
    localStorage.setItem(TOKEN_ID, token);
  }

  public requestNewToken(): Observable<void> {
    return this.http.get("/api/v1/login/token", {}).pipe(map(() => null));
  }

  public startTokenAutoRefresh() {
    setInterval(() => {
      if (this.isAuthenticated()) {
        const token = this.getToken();
        if (Math.floor(this.getCurrentServerTime() / 1000) + 90 >= token.exp) {
          this.requestNewToken().subscribe(() => {});
        }
      }
    }, 60000);
  }

  private isTokenExpired(token: string): boolean {
    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (expirationDate) {
      return expirationDate.getTime() <= this.getCurrentServerTime();
    }

    return this.jwtHelper.isTokenExpired(token);
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
    const decodedToken = this.decodeToken(token);
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
