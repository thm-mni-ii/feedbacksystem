import { Injectable } from "@angular/core";

import "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-scss";
import { Element } from "@angular/compiler";

declare var Prism: any;

@Injectable({
  providedIn: "root",
})
export class PrismService {
  constructor() {}

  highlightAll() {
    Prism.highlightAll();
  }

  highlight(element: Element) {
    Prism.highlightElement(element);
  }

  convertHtmlIntoString(text: string) {
    return text
      .replace(new RegExp("&", "g"), "&amp;")
      .replace(new RegExp("<", "g"), "&lt;");
  }
}
