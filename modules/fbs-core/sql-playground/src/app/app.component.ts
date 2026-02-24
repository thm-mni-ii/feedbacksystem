import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // Read JWT token from URL query parameter for iframe embedding
    // Token is passed as ?jsessionid=TOKEN (same convention as modelling tool)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("jsessionid");
    if (token) {
      localStorage.setItem("token", token);
    }
  }
}
