import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IntegrationService } from "../../service/integration.service";
import { of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Component({
  selector: "app-sql-playground-iframe",
  templateUrl: "./sql-playground-iframe.component.html",
  styleUrls: ["./sql-playground-iframe.component.scss"],
})
export class SqlPlaygroundIframeComponent implements OnInit {
  token: string;
  safeUrl: SafeResourceUrl;

  constructor(
    private titlebar: TitlebarService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private integrationService: IntegrationService
  ) {
    this.token = this.auth.loadToken();
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl("about:blank");
  }

  ngOnInit() {
    this.titlebar.emitTitle("SQL Playground");
    this.getURL();
  }

  getURL() {
    this.integrationService
      .getIntegration("sqlplayground")
      .pipe(
        map(({ url }) =>
          this.sanitizer.bypassSecurityTrustResourceUrl(
            `${url}?token=${this.token}&iframe=true`
          )
        ),
        catchError((error) => {
          console.error("Error fetching SQL Playground URL:", error);
          return of(
            this.sanitizer.bypassSecurityTrustResourceUrl("about:blank")
          );
        })
      )
      .subscribe((safeUrl) => {
        this.safeUrl = safeUrl;
      });
  }
}
