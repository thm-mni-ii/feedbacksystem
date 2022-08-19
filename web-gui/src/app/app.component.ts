import { Component, OnInit } from "@angular/core";
import { AuthService } from "./service/auth.service";

/**
 * Component that routes from login to app
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.startTokenAutoRefresh();
  }
}
