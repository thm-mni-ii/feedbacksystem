import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { PrismService } from "src/app/service/prism.service";
import { Store } from "@ngrx/store";
import * as SqlInputTabsActions from "../state/sql-input-tabs.actions";
import * as fromSqlInputTabs from "../state/sql-input-tabs.selectors";
import { QueryTab } from "../../../../model/sql_playground/QueryTab";

@Component({
  selector: "app-highlighted-input",
  templateUrl: "./highlighted-input.component.html",
  styleUrls: ["./highlighted-input.component.scss"],
})
export class HighlightedInputComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked
{
  @ViewChild("textArea") textArea!: ElementRef;
  @ViewChild("codeContent") codeContent!: ElementRef;
  @ViewChild("pre") pre!: ElementRef;

  subs: Subscription[] = [];
  highlighted = false;
  codeType = "sql";

  groupForm = new FormGroup({
    content: new FormControl(""),
  });
  selectedIndex: number;

  titleText: any;
  @Output() update = new EventEmitter<unknown>();

  private lastUpdated: string;

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  constructor(
    private prismService: PrismService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.listenForm();
    //this.synchronizeScroll();
  }

  ngAfterViewInit() {
    this.prismService.highlightAll();
  }

  ngAfterViewChecked() {
    if (this.highlighted) {
      this.prismService.highlightAll();
      this.highlighted = false;
    }
  }

  private unsubscribe() {
    console.log("unsub", this.subs);
    this.subs.forEach((sub) => sub.unsubscribe());
    this.subs = [];
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  listenForm() {
    console.log("lf");
    this.unsubscribe();
    this.subs.push(
      this.store
        .select(fromSqlInputTabs.selectActiveTabIndex)
        .pipe(
          mergeMap((activeIndex) => {
            return this.store
              .select(fromSqlInputTabs.selectTabs)
              .pipe(
                map(
                  (tabs) =>
                    [activeIndex, tabs[activeIndex]] as [number, QueryTab]
                )
              );
          })
        )
        .subscribe(([tabIndex, activeTab]) => {
          this.selectedIndex = tabIndex;
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
                index: this.selectedIndex,
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

    this.prismService.highlightAll();
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

  cleanText(text: string) {
    console.log(text);

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
