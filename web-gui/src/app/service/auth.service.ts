import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
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


  logout() {
    localStorage.removeItem('user');
  }

  getUsername() {
    return this.getDecodedToken().username;
  }


  /**
   * Checks if the user token is expired
   */
  isAuthenticated(): boolean {
    return !this.jwtHelper.isTokenExpired(this.getToken());
  }


}

interface LoginResult {
  login_result: string;
  token: string;
}

interface JWTToken {
  sub: string;
  roles: string;
  username: string;
  iat: string;
  exp: string;
}
