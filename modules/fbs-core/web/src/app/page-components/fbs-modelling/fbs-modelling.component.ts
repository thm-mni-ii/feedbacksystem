import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-fbs-modelling",
  templateUrl: "./fbs-modelling.component.html",
  styleUrls: ["./fbs-modelling.component.scss"],
})
export class FbsModellingComponent implements OnInit {
  token: string;
  safeUrl: SafeResourceUrl;

  constructor(
    private titlebar: TitlebarService,
    private auth: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.token = this.auth.loadToken();
  }
  ngOnInit() {
    this.titlebar.emitTitle("FBS Modellierung");
  }

  getURL(): SafeResourceUrl {
    const url = `https://fbs-modelling.mni.thm.de/#/login?jsessionid=${this.token}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return this.safeUrl;
  }
}
