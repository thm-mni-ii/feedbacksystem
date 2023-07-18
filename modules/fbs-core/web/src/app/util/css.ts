import { ElementRef } from "@angular/core";

export function insertShadowRootStyle(element: ElementRef, rules: string[]) {
  var sheet = new CSSStyleSheet();
  rules.forEach((rule) => sheet.insertRule(rule));
  element.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
}
