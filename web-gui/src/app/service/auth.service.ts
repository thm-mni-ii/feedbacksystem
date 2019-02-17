import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {Succeeded} from '../interfaces/HttpInterfaces';

const TOKEN_ID = 'token';

/**
 * Service that manages login and logout of user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService,
              @Inject(DOCUMENT) private document: Document) {
  }


  /**
   * Get user Token
   */
  private getToken() {
    return localStorage.getItem(TOKEN_ID);
  }

  /**
   * Login function to authenticate user with LDAP
   * system
   *
   */
  login(username: string, password: string): Observable<HttpResponse<Succeeded>> {
    return this.http.post<Succeeded>('/api/v1/login/ldap', {username: username, password: password},
      {observe: 'response'});
  }


  /**
   * Check if user accepted data privacy
   * @param username The user to check for
   */
  loginPrivacyCheck(username: string): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/login/privacy/check', {username: username});
  }


  /**
   * Deletes token from localstorage
   * and terminates session for user.
   */
  logout() {
    localStorage.removeItem(TOKEN_ID);
  }


  /**
   * Checks if the user token is expired
   */
  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getToken());
  }


}

