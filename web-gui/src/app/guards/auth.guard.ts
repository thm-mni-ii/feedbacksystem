import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from "../service/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(private auth: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['']);
    return false;
  }
}
