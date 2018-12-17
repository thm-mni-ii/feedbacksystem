import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";

/**
 * Service that manages login and logout for an user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService, private router: Router) {
  }


  /**
   * Decoded jwt token with information from user
   */
  private getDecodedToken(): JWTToken {
    return this.jwtHelper.decodeToken(this.getToken());
  }

  /**
   * Get user Token
   */
  private getToken() {
    return localStorage.getItem('user');
  }

  /**
   * Gives back a valid token for an user,
   * for an given username.
   * @param username that will be used for a valid session
   */
  login_fake(username: string) {
    return this.http.post<LoginResult>("/api/v1/login/token", {
      name: username
    }, {observe: 'response'}).subscribe(user => {

      const token = user.headers.get('Authorization').replace("Bearer", "").replace(" ", "");

      localStorage.setItem('user', token);

      switch (this.getDecodedToken().roles) {
        case 'admin':
          this.router.navigate(['admin']);
          break;
        case 'docent':
          this.router.navigate(['prof']);
          break;
        case 'moderator':
          //TODO: Implement route for moderator
          break;
        case 'tutor':
          this.router.navigate(['user']);
          break;
        case 'student':
          this.router.navigate(['user', 'dashboard']);
          break;
      }
      return user;
    });
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
    return this.http.post<LoginResult>("/api/v1/login", {
      username: username,
      password: password
    }, {observe: 'response'}).subscribe(user => {


      localStorage.setItem('user', JSON.stringify(user.headers.get('Authorization')));

      switch (this.getDecodedToken().roles) {
        case 'admin':
          this.router.navigate(['admin']);
          break;
        case 'dozent':
          this.router.navigate(['prof']);
          break;
        case 'hiwi':
          //TODO: Implement route for hiwi
          break;
        case 'student':
          this.router.navigate(['user']);
          break;
      }
      return user;
    })
  }


  /**
   * Deletes token from localstorage
   * and terminates session for user.
   */
  logout() {
    localStorage.removeItem('user');
  }


  /**
   * Get username from an
   * user that is logged in.
   */
  getUsername(): string {
    return this.getDecodedToken().username;
  }


  /**
   * Checks if the user token is expired
   */
  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getToken());
  }


}

/**
 * Used to parse Login result
 */
interface LoginResult {
  login_result: string;
  token: string;
}

/**
 * Used to parse JWT token
 */
interface JWTToken {
  sub: string;
  roles: string;
  username: string;
  iat: string;
  exp: string;
}
