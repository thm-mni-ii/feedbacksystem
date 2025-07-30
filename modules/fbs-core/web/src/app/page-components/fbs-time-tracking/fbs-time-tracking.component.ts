import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "src/app/service/auth.service";
import { TitlebarService } from "src/app/service/titlebar.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-fbs-time-tracking",
  templateUrl: "./fbs-time-tracking.component.html",
  styleUrls: ["./fbs-time-tracking.component.scss"],
})
export class FbsTimeTrackingComponent implements OnInit {
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
    this.titlebar.emitTitle("FBS Time Tracking");
  }

  getURL(): SafeResourceUrl {
    const url = `https://feedback.mni.thm.de/kanban/time/?token=${this.token}&iframe=true`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.cdr.detach(); // stops iframe from reloading
    return this.safeUrl;
  }
}
