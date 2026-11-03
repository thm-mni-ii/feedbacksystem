import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-skip-link",
  templateUrl: "./skip-link.component.html",
  styleUrls: ["./skip-link.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SkipLinkComponent implements OnInit {
  @Input()
  anchor: string;
  skipLinkPath: string;

  constructor(private router: Router) {}

  ngOnInit() {
    this.skipLinkPath = `${this.router.url}#${this.anchor}`;
  }
}
