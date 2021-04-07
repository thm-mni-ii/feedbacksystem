import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'allowLineBreak'
})
export class AllowLineBreakPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  transform(input: string): unknown {
    const lineBroken = input.replace(/\n/g, '<br>');
    const purified = DOMPurify.sanitize(lineBroken, {ALLOWED_TAGS: ['br']});
    return this.sanitizer.bypassSecurityTrustHtml(purified);
  }
}
