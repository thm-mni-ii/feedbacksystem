import { Component, OnInit } from "@angular/core";
import { TitlebarService } from "../../service/titlebar.service";

@Component({
  selector: "app-analytics-tool",
  templateUrl: "./analytics-tool.component.html",
  styleUrls: ["./analytics-tool.component.scss"],
})
export class AnalyticsToolComponent implements OnInit {
  constructor(private titlebar: TitlebarService) {}
  ngOnInit() {
    this.titlebar.emitTitle("Analyse Plattform");
  }
}
