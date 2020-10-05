import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Roles} from "../model/Roles";
import {AuthService} from "../service/auth.service";

/**
 * Checks if user is docent or admin
 */
@Injectable({
  providedIn: 'root'
})
export class DocentGuard implements CanActivate {
  constructor(private auth: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    localStorage.setItem('route', state.url);
    return this.auth.getToken().courseRoles.find(o => o == Roles.CourseRole.DOCENT)
  }
}
