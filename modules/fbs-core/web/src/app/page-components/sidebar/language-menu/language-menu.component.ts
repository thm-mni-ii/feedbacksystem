import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
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
  @ViewChild("menu")
  menu: ElementRef;
  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  setLanguage(code: "en" | "de"): void {
    this.i18NextService.changeLanguage(code).then(() => {});
  }
}
