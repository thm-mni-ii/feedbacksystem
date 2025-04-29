import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-fbs-questionary",
  templateUrl: "./fbs-questionary.component.html",
  styleUrls: ["./fbs-questionary.component.scss"],
})
export class FbsQuestionaryComponent implements OnInit {
  token: string;
  safeUrl: SafeResourceUrl;

  constructor(
    private titlebar: TitlebarService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.token = this.auth.loadToken();
  }
  ngOnInit() {
    this.titlebar.emitTitle("FBS Modellierung");
  }

  getURL(): SafeResourceUrl {
    const url = `http://localhost:8086?jsessionid=${this.token}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.cdr.detach(); // stops iframe from reloading
    return this.safeUrl;
  }
}
