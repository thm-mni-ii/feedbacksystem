import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IntegrationService } from "../../service/integration.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-fbs-modelling",
  templateUrl: "./fbs-modelling.component.html",
  styleUrls: ["./fbs-modelling.component.scss"],
})
export class FbsModellingComponent implements OnInit {
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
    this.titlebar.emitTitle("FBS Modellierung");
    this.getURL();
  }

  getURL() {
    this.safeUrl = this.integrationService.getIntegration("modelling").pipe(
      map(({ url }) => {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `${url}#/login?jsessionid=${this.token}&iframe=true`
        );
      })
    );
  }
}
