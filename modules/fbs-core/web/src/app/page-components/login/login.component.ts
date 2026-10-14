import { Component, Inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../service/auth.service";
import { CookieService } from "ngx-cookie-service";
import { GoToService } from "../../service/goto.service";
import { EmbeddingService } from "../../service/embedding.service";

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
    private goToService: GoToService,
    private embeddingService: EmbeddingService
  ) {}

  async ngOnInit() {
    if (this.embeddingService && this.embeddingService.isEmbedded) {
      const tokenLoaded = await this.embeddingService.waitForToken(2000);
      if (tokenLoaded && this.auth.isAuthenticated()) {
        this.navigateAfterAuthentication();
        return;
      }
      this.router.navigate(["/courses"]);
      return;
    }

    const token = this.cookieService.get("jwt");
    if (token) {
      this.auth.storeToken(token);
      this.cookieService.delete("jwt");
    }

    await this.auth.tryLogin();

    if (this.auth.isAuthenticated()) {
      this.navigateAfterAuthentication();
      return;
    }

    this.goToService.clearGoTo();

    if (
      this.router.url.includes("oauth2/callback") ||
      this.router.url === "/login" ||
      this.router.url === "/login/"
    ) {
      this.auth.login();
    }
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
   * Redirect to OIDC login
   */
  casLogin() {
    this.auth.login();
  }

  /**
   * Redirect to OIDC login
   */
  oidcLogin() {
    this.auth.login();
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
