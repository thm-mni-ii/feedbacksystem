import { Injectable } from "@angular/core";
import * as marked from "marked";
import DOMPurify from "dompurify";

@Injectable({ providedIn: "root" })
export class MarkdownService {
  constructor() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  parseToString(markdown: string): string {
    const unsafeHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(unsafeHtml);
  }
}
