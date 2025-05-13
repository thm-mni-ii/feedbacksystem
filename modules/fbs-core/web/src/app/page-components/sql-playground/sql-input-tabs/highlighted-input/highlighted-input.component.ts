import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { PrismService } from "src/app/service/prism.service";
import { Store } from "@ngrx/store";
import * as SqlInputTabsActions from "../state/sql-input-tabs.actions";
import * as fromSqlInputTabs from "../state/sql-input-tabs.selectors";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "app-highlighted-input",
  templateUrl: "./highlighted-input.component.html",
  styleUrls: ["./highlighted-input.component.scss"],
})
export class HighlightedInputComponent implements OnDestroy, AfterViewInit {
  @ViewChild("textArea") textArea!: ElementRef;
  @ViewChild("codeContent") codeContent!: ElementRef;
  @ViewChild("pre") pre!: ElementRef;
  @Input() submit: MatButton;

  subs: Subscription[] = [];
  codeType = "sql";

  groupForm = new FormGroup({
    content: new FormControl(""),
  });

  titleText: any;
  @Output() update = new EventEmitter<unknown>();

  private lastUpdated: string;
  @Input() index!: number;

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  constructor(
    private prismService: PrismService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private store: Store
  ) {}

  ngAfterViewInit() {
    this.listenForm();
  }

  private unsubscribe() {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.subs = [];
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  listenForm() {
    this.unsubscribe();
    this.subs.push(
      this.store
        .select(fromSqlInputTabs.selectTabs)
        .pipe(map((tabs) => tabs[this.index]))
        .subscribe((activeTab) => {
          this.groupForm.setValue({
            content: activeTab?.content ?? "",
          });
          this.render(activeTab?.content ?? "");
        })
    );

    this.subs.push(
      this.groupForm.valueChanges
        .pipe(map((val: any) => val.content))
        .subscribe((content: string) => {
          this.render(content);

          if (content !== this.lastUpdated) {
            this.lastUpdated = content;
            this.store.dispatch(
              SqlInputTabsActions.updateTabContent({
                index: this.index,
                content: content,
              })
            );
          }
        })
    );
  }

  private render(content: string) {
    const modifiedContent = this.prismService.convertHtmlIntoString(content);

    this.renderer.setProperty(
      this.codeContent.nativeElement,
      "innerHTML",
      modifiedContent
    );

    this.prismService.highlight(this.codeContent.nativeElement);
  }

  onTab(event) {
    event.preventDefault();
    var start = event.target.selectionStart;
    var end = event.target.selectionEnd;
    this.groupForm.patchValue({
      content:
        this.contentControl.substring(0, start) +
        "\t" +
        this.contentControl.substring(end),
    });

    // put caret at right position again
    event.target.selectionStart = event.target.selectionEnd = start + 1;
  }

  onEnter(event) {
    event.preventDefault();
    this.submit?.focus();
  }

  cleanText(text: string) {
    // allow only caracteres for valid sql query
    text = text.replace(
      /[^a-zA-Z0-9üöäÄÖÜß\(\)\[\]\{\}\s\.\,\;\=\+\-\*\/\>\<\!\@\#\$\?\%\^\&\_\~\`´°²³§\:\'\"\|\\]/g,
      ""
    );

    // remove (vertical tab), (form feed), (line separator), (paragraph separator), and (narrow no-break space) characters
    text = text.replace(/[\u000B\u000C\u0085\u2028\u2029]/g, " ");

    return text;
  }
}
