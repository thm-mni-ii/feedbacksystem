import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from "@angular/router";
import { AuthService } from "../service/auth.service";
import { EmbeddingService } from "../service/embedding.service";

/**
 * Checks if user is logged in if not route to login page
 */
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private embeddingService: EmbeddingService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    if (this.embeddingService.isEmbedded) {
      const tokenLoaded = await this.embeddingService.waitForToken(1500);
      if (tokenLoaded && this.auth.isAuthenticated()) {
        return true;
      }
    }

    localStorage.setItem("route", state.url);
    this.auth.login();
    return false;
  }
}
