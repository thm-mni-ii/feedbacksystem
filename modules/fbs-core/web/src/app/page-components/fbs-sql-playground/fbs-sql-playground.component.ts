import { Component, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-fbs-sql-playground",
  templateUrl: "./fbs-sql-playground.component.html",
  styleUrls: ["./fbs-sql-playground.component.scss"],
})
export class FbsSqlPlaygroundComponent {
  token: string;
  safeUrl: SafeResourceUrl;

  constructor(
    private titlebar: TitlebarService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.token = this.auth.loadToken();
    this.titlebar.emitTitle("SQL Playground");
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `/sql-playground/?jsessionid=${this.token}`
    );
    this.cdr.detach(); // stops iframe from reloading
  }
}
