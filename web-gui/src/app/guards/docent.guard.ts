import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {UserService} from '../service/user.service';

@Injectable({
  providedIn: 'root'
})
export class DocentGuard implements CanActivate {


  constructor(private user: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.user.getUserRole() === 4 || this.user.getUserRole() === 1;
  }

}
