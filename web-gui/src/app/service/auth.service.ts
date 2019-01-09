import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

const TOKEN_ID = 'token';

/**
 * Service that manages login and logout for an user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
  }


  /**
   * Get user Token
   */
  private getToken() {
    return localStorage.getItem(TOKEN_ID);
  }

  /**
   * Gives back a valid token for an user,
   * for an given username.
   * @param username that will be used for a valid session
   */
  login_fake(username: string): Observable<string> {
    return this.http.post('/api/v1/login/token', {
      name: username
    }, {observe: 'response'}).pipe(map(response => {
      const authHeader: string = response.headers.get('Authorization');
      const token: string = authHeader.replace('Bearer ', '');
      localStorage.setItem(TOKEN_ID, token);
      return token;
    }));
  }

  /**
   * Login function to authenticate user with CAS
   * system
   *
   * //TODO Implement real functionality
   *
   * @param username deprecated
   * @param password deprecated
   */
  login(username: string, password: string) {
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

