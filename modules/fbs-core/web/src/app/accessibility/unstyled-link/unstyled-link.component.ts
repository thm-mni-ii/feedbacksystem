import { Component, Input } from "@angular/core";

@Component({
  selector: "app-unstyled-link",
  templateUrl: "./unstyled-link.component.html",
  styleUrls: ["./unstyled-link.component.scss"],
})
export class UnstyledLinkComponent {
  @Input()
  href: string;
}
