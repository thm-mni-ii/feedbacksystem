import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';


/**
 * Get information of user from token
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private jwtHelper: JwtHelperService) {
  }

  /**
   * Decoded jwt token with information from user
   */
  private getDecodedToken(): JWTToken | null {
    return this.jwtHelper.decodeToken(localStorage.getItem('token'));
  }

  /**
   * Get username from an
   * user that is logged in.
   */
  getUsername(): string | null {
    return this.getDecodedToken().username;
  }

  getUserRole(): string {
    return this.getDecodedToken().roles;
  }


}


/**
 * Used to parse JWT token
 */
export interface JWTToken {
  sub: string;
  roles: string;
  username: string;
  iat: string;
  exp: string;
}
