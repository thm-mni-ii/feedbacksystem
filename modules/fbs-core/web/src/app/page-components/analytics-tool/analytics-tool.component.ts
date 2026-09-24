import { Component, OnInit } from "@angular/core";
import { TitlebarService } from "../../service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IntegrationService } from "../../service/integration.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-analytics-tool",
  templateUrl: "./analytics-tool.component.html",
  styleUrls: ["./analytics-tool.component.scss"],
})
export class AnalyticsToolComponent implements OnInit {
  safeUrl: Observable<SafeResourceUrl>;

  constructor(
    private titlebar: TitlebarService,
    private sanitizer: DomSanitizer,
    private integrationService: IntegrationService
  ) {}

  ngOnInit() {
    this.titlebar.emitTitle("Analyse Plattform");
    this.getURL();
  }

  getURL() {
    this.safeUrl = this.integrationService
      .getIntegration("eat")
      .pipe(
        map(({ url }) => this.sanitizer.bypassSecurityTrustResourceUrl(url))
      );
  }
}
