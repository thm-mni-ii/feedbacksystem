import { Component, Input } from "@angular/core";

@Component({
  standalone: false,
  selector: "app-bordered-container",
  templateUrl: "./bordered-container.component.html",
  styleUrls: ["./bordered-container.component.scss"],
})
export class BorderedContainerComponent {
  @Input() title?: string;
  @Input() yScrollable: boolean = false;
  @Input() xScrollable: boolean = false;
  @Input() input: boolean = false;
}
