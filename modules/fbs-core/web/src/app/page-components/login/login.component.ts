import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../service/auth.service";
import { LegalService } from "../../service/legal.service";
import { DataprivacyDialogComponent } from "../../dialogs/dataprivacy-dialog/dataprivacy-dialog.component";
import { CookieService } from "ngx-cookie-service";
import { GoToService } from "../../service/goto.service";

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private legalService: LegalService,
    private cookieService: CookieService,
    private goToService: GoToService
  ) {}

  ngOnInit() {
    const requestedRoute = this.route.snapshot.queryParamMap.get("route");
    if (requestedRoute) {
      localStorage.setItem("route", requestedRoute);
    }

    if (this.route.snapshot.queryParamMap.get("ssoError")) {
      this.snackbar.open(
        "Die Anmeldung über Single Sign-On konnte nicht abgeschlossen werden.",
        "OK",
        { duration: 4000 }
      );
    }

    const token = this.cookieService.get("jwt");
    if (token) {
      localStorage.setItem("token", token);
      this.cookieService.delete("jwt");
    }

    if (this.auth.isAuthenticated()) {
      const goneTo = this.goToService.goTo();
      if (!goneTo) {
        const extraRoute = localStorage.getItem("route");
        if (extraRoute) {
          localStorage.removeItem("route");
          this.router.navigateByUrl("" + extraRoute);
        } else {
          this.router.navigate(["/courses"]);
        }
      }
    }

    this.goToService.clearGoTo();
  }

  /**
   * Login user locally into the system
   */
  localLogin() {
    this.auth.unifiedLogin(this.username, this.password).subscribe(
      (token) => {
        this.checktermsOfUse(token.id);
      },
      () => {
        this.snackbar.open(
          "Prüfen Sie Ihren Benutzernamen und Ihr Passwort.",
          "OK",
          { duration: 3000 }
        );
      }
    );
  }

  /**
   * Open Github Repository in new Tab
   */
  openGithub() {
    window.open(
      "https://github.com/thm-mni-ii/feedbacksystem",
      "_blank",
      "noopener,noreferrer"
    );
  }

  /**
   * Redirect to the configured single sign-on login
   */
  ssoLogin() {
    this.auth.startSingleSignOnLogin(
      this.route.snapshot.queryParamMap.get("route")
    );
  }

  private checktermsOfUse(uid: number) {
    this.legalService.getTermsOfUse(uid).subscribe((res) => {
      if (res.accepted) {
        this.router.navigateByUrl("/courses");
      } else {
        this.dialog
          .open(DataprivacyDialogComponent, { data: { onlyForShow: false } })
          .afterClosed()
          .subscribe(
            (data) => {
              if (data.success) {
                this.legalService.acceptTermsOfUse(uid).subscribe(() => {
                  this.router.navigateByUrl("/courses");
                });
              } else {
                this.auth.logout();
              }
            },
            () => {
              this.auth.logout();
            }
          );
      }
    });
  }
}
