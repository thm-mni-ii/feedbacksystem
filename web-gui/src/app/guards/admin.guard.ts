import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from "@angular/router";
import { Roles } from "../model/Roles";
import { AuthService } from "../service/auth.service";

/**
 * Checks if user is admin
 */
@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    localStorage.setItem("route", state.url);
    const globalRole = this.auth.getToken().globalRole;
    return Roles.GlobalRole.isAdmin(globalRole);
  }
}
