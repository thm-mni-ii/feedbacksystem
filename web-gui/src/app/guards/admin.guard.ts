import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {UserService} from '../service/user.service';

/**
 * Checks if user is admin
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {


  constructor(private user: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.user.getUserRole() === 1;
  }

}
