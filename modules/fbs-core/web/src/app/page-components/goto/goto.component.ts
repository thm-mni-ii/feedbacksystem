import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GoToService } from "../../service/goto.service";
import { AuthService } from "../../service/auth.service";
import { EmbeddingService } from "../../service/embedding.service";

@Component({
  selector: "app-goto",
  templateUrl: "./goto.component.html",
  styleUrls: ["./goto.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GoToComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private goToService: GoToService,
    private authService: AuthService,
    private embeddingService: EmbeddingService
  ) {}

  async ngOnInit() {
    const params = this.route.snapshot.paramMap;
    const courseID = Number.parseInt(params.get("id"), 10);
    const target = params.get("target");
    let app = false;
    if (target === "app") {
      app = true;
    }
    this.goToService.setGoTo(courseID, app);

    if (this.authService.isAuthenticated()) {
      this.goToService.goTo();
      return;
    }

    if (this.embeddingService.isEmbedded) {
      const tokenLoaded = await this.embeddingService.waitForToken(2500);
      if (tokenLoaded && this.authService.isAuthenticated()) {
        this.goToService.goTo();
        return;
      }
    }

    this.authService.login();
  }
}
