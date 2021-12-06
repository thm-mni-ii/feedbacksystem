import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../service/auth.service';
import {Roles} from '../model/Roles';

/**
 * Checks if user is moderator or admin
 */
@Injectable({
  providedIn: 'root'
})
export class ModeratorGuard implements CanActivate {

  constructor(private auth: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    localStorage.setItem('route', state.url);
    const globalRole = this.auth.getToken().globalRole;
    return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole);
  }
}
