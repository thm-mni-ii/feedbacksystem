import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-unstyled-link",
  templateUrl: "./unstyled-link.component.html",
  styleUrls: ["./unstyled-link.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnstyledLinkComponent {
  @Input()
  href: string;
}
