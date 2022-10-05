import { Component, Input } from "@angular/core";

@Component({
  selector: "app-bordered-container",
  templateUrl: "./bordered-container.component.html",
  styleUrls: ["./bordered-container.component.scss"],
})
export class BorderedContainerComponent {
    @Input() title?: string;
}
