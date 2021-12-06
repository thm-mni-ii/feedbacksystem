import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Roles} from '../model/Roles';
import {AuthService} from '../service/auth.service';

/**
 * Checks if user is docent
 */
@Injectable({
  providedIn: 'root'
})
export class IsGeqDocentGuard implements CanActivate {
  constructor(private auth: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    localStorage.setItem('route', state.url);
    const globalRole = this.auth.getToken().globalRole;
    const isDocent = this.auth.getToken().courseRoles.find(o => o === Roles.CourseRole.DOCENT);
    return Roles.GlobalRole.isAdmin(globalRole) || Roles.GlobalRole.isModerator(globalRole) || isDocent;
  }
}
