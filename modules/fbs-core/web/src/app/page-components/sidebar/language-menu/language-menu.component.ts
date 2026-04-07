import { Component, Inject, ViewChild } from "@angular/core";
import { MatMenu } from "@angular/material/menu";
import { I18NEXT_SERVICE, ITranslationService } from "angular-i18next";

/**
 * Language Menu
 */
@Component({
  selector: "app-language-menu",
  templateUrl: "./language-menu.component.html",
  styleUrls: ["./language-menu.component.scss"],
  exportAs: "languageMenu",
})
export class LanguageMenuComponent {
  @ViewChild("menu", { static: true })
  menu!: MatMenu;
  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  setLanguage(code: "en" | "de"): void {
    this.i18NextService.changeLanguage(code).then(() => {});
  }
}
