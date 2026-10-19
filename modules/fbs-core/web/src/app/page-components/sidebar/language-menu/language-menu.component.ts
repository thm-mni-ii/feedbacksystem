import {
  Component,
  Inject,
  ViewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { I18NEXT_SERVICE, ITranslationService } from "angular-i18next";
import { MatMenu } from "@angular/material/menu";

/**
 * Language Menu
 */
@Component({
  selector: "app-language-menu",
  templateUrl: "./language-menu.component.html",
  styleUrls: ["./language-menu.component.scss"],
  exportAs: "languageMenu",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LanguageMenuComponent {
  @ViewChild("menu", { static: true })
  menu: MatMenu;
  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  setLanguage(code: "en" | "de"): void {
    this.i18NextService.changeLanguage(code).then(() => {});
  }
}
