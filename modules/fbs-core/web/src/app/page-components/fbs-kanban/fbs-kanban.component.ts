import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IntegrationService } from "../../service/integration.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-fbs-kanban",
  templateUrl: "./fbs-kanban.component.html",
  styleUrls: ["./fbs-kanban.component.scss"],
})
export class FbsKanbanComponent implements OnInit {
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
    this.titlebar.emitTitle("FBS Kanban");
    this.getURL();
  }

  getURL() {
    this.safeUrl = this.integrationService.getIntegration("kanban").pipe(
      map(({ url }) => {
        const separator = url.includes("?") ? "&" : "?";
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `${url}${separator}token=${this.token}&iframe=true`
        );
      })
    );
  }
}
