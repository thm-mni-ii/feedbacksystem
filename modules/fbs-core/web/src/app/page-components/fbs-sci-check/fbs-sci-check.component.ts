import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-fbs-sci-check",
  templateUrl: "./fbs-sci-check.component.html",
  styleUrls: ["./fbs-sci-check.component.scss"],
})
export class FbsSciCheckComponent implements OnInit {
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
    this.titlebar.emitTitle("FBS SciCheck");
  }

  getURL(): SafeResourceUrl {
    const url = `https://feedback.mni.thm.de/scicheck/#/login?token=${this.token}&iframe=true`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.cdr.detach(); // stops iframe from reloading
    return this.safeUrl;
  }
}
