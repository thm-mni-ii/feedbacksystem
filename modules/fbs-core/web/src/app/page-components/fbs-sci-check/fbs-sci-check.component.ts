import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IntegrationService } from "../../service/integration.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-fbs-sci-check",
  templateUrl: "./fbs-sci-check.component.html",
  styleUrls: ["./fbs-sci-check.component.scss"],
})
export class FbsSciCheckComponent implements OnInit {
  token: string;
  safeUrl: Observable<SafeResourceUrl>;

  constructor(
    private titlebar: TitlebarService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private integrationService: IntegrationService
  ) {
    this.token = this.auth.loadToken();
  }
  ngOnInit() {
    this.titlebar.emitTitle("FBS SciCheck");
    this.getURL();
  }

  getURL() {
    this.safeUrl = this.integrationService.getIntegration("sciCheck").pipe(
      map(({ url }) => {
        const baseUrl = url.endsWith("/") ? url : `${url}/`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `${baseUrl}#/login?token=${this.token}&iframe=true`
        );
      })
    );
  }
}
