import { Component, Inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../service/auth.service";
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
    private router: Router,
    private auth: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private goToService: GoToService
  ) {}

  ngOnInit() {
    const token = this.cookieService.get("jwt");
    if (token) {
      localStorage.setItem("token", token);
      this.cookieService.delete("jwt");
    }

    if (this.auth.isAuthenticated()) {
      this.navigateAfterAuthentication();
    }

    this.goToService.clearGoTo();
  }

  /**
   * Login user locally into the system
   */
  localLogin() {
    this.auth.unifiedLogin(this.username, this.password).subscribe(
      () => {
        this.navigateAfterAuthentication();
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
   * Redirect to cas login
   */
  casLogin() {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host;
    this.document.location.href =
      "https://cas.thm.de/cas/login?service=" + baseUrl + "/api/v1/login/cas";
  }

  private navigateAfterAuthentication() {
    const goneTo = this.goToService.goTo();
    if (goneTo) {
      return;
    }

    const extraRoute = localStorage.getItem("route");
    if (extraRoute) {
      localStorage.removeItem("route");
      this.router.navigateByUrl(extraRoute);
    } else {
      this.router.navigate(["/courses"]);
    }
  }
}
