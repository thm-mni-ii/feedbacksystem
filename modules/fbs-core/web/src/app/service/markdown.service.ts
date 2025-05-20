import { Injectable } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as marked from "marked";
import DOMPurify from "dompurify";

@Injectable({ providedIn: "root" })
export class MarkdownService {
  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  parse(markdown: string): SafeHtml {
    const unsafeHtml = marked.parse(markdown) as string;
    const cleanHtml = DOMPurify.sanitize(unsafeHtml);
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  parseToString(markdown: string): string {
    const unsafeHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(unsafeHtml);
  }
}
