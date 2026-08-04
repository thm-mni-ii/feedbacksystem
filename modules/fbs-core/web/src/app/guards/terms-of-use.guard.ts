import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { DataprivacyDialogComponent } from "../dialogs/dataprivacy-dialog/dataprivacy-dialog.component";
import { AuthService } from "../service/auth.service";
import { LegalService } from "../service/legal.service";

/**
 * Blocks protected routes until the authenticated user accepted the terms of use.
 */
@Injectable({
  providedIn: "root",
})
export class TermsOfUseGuard implements CanActivate, CanActivateChild {
  private acceptedUserIds = new Set<number>();

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private legalService: LegalService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.checkTermsOfUse(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.checkTermsOfUse(state.url);
  }

  private checkTermsOfUse(targetUrl: string): Observable<boolean> | boolean {
    if (!this.auth.isAuthenticated()) {
      return true;
    }

    const uid = this.auth.getToken().id;
    if (this.acceptedUserIds.has(uid)) {
      return true;
    }

    return this.legalService.getTermsOfUse(uid).pipe(
      switchMap((res) => {
        if (res.accepted) {
          this.acceptedUserIds.add(uid);
          return of(true);
        }

        return this.dialog
          .open(DataprivacyDialogComponent, {
            data: { onlyForShow: false },
            disableClose: true,
          })
          .afterClosed()
          .pipe(
            take(1),
            switchMap((data) => {
              if (!data || !data.success) {
                return this.logoutAndRedirect(targetUrl);
              }

              return this.legalService.acceptTermsOfUse(uid).pipe(
                map(() => {
                  this.acceptedUserIds.add(uid);
                  return true;
                }),
                catchError(() => this.logoutAndRedirect(targetUrl))
              );
            })
          );
      }),
      catchError(() => this.logoutAndRedirect(targetUrl))
    );
  }

  private logoutAndRedirect(targetUrl: string): Observable<boolean> {
    this.acceptedUserIds.clear();
    this.auth.logout();
    localStorage.setItem("route", targetUrl);
    this.router.navigate(["login"]);
    return of(false);
  }
}
