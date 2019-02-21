import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {UserService} from '../service/user.service';

/**
 * Checks if user is docent or admin
 */
@Injectable({
  providedIn: 'root'
})
export class DocentGuard implements CanActivate {


  constructor(private user: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    localStorage.setItem('route', state.url);
    return this.user.getUserRole() === 4 || this.user.getUserRole() === 1;
  }

}
