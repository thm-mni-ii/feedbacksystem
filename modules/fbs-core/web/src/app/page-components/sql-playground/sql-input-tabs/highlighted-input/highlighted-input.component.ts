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
import { Subscription, fromEvent } from "rxjs";
import { map, distinctUntilChanged, mergeMap } from "rxjs/operators";
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
export class HighlightedInputComponent implements OnInit, OnDestroy {
  @ViewChild("textArea", { static: true }) textArea!: ElementRef;
  @ViewChild("codeContent", { static: true }) codeContent!: ElementRef;
  @ViewChild("pre", { static: true }) pre!: ElementRef;

  sub!: Subscription;
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
    console.log("init");
    this.listenForm();
    //this.synchronizeScroll();
  }

  /*ngAfterViewInit() {
    this.prismService.highlightAll();
  }

  ngAfterViewChecked() {
    if (this.highlighted) {
      this.prismService.highlightAll();
      this.highlighted = false;
    }
  }*/

  ngOnDestroy() {
    console.log("detroy");
    this.sub?.unsubscribe();
  }

  listenForm() {
    console.log("listen form");
    this.store
      .select(fromSqlInputTabs.selectActiveTabIndex)
      .pipe(
        mergeMap((activeIndex) => {
          return this.store
            .select(fromSqlInputTabs.selectTabs)
            .pipe(
              map(
                (tabs) => [activeIndex, tabs[activeIndex]] as [number, QueryTab]
              )
            );
        })
      )
      .subscribe(([tabIndex, activeTab]) => {
        console.log("tab changed", activeTab);
        this.selectedIndex = tabIndex;
        this.groupForm.setValue({
          content: activeTab?.content ?? "",
        });
        console.log("change complete", {
          value: this.groupForm.value.content,
          index: this.selectedIndex,
        });
      });

    this.sub = this.groupForm.valueChanges
      .pipe(
        map((val: any) => val.content),
        distinctUntilChanged((a, b) => a === b)
      )
      .subscribe((content: string) => {
        /*const modifiedContent =
          this.prismService.convertHtmlIntoString(content);

        this.renderer.setProperty(
          this.codeContent.nativeElement,
          "innerHTML",
          modifiedContent
        );

        this.highlighted = true;*/

        if (content !== this.lastUpdated) {
          this.lastUpdated = content;
          this.store.dispatch(
            SqlInputTabsActions.updateTabContent({
              index: this.selectedIndex,
              content: content,
            })
          );
        }
      });
  }

  synchronizeScroll() {
    const localSub = fromEvent(this.textArea.nativeElement, "scroll").subscribe(
      () => {
        const toTop = this.textArea.nativeElement.scrollTop;
        const toLeft = this.textArea.nativeElement.scrollLeft;

        this.renderer.setProperty(this.pre.nativeElement, "scrollTop", toTop);
        this.renderer.setProperty(
          this.pre.nativeElement,
          "scrollLeft",
          toLeft + 0.2
        );
      }
    );

    this.sub.add(localSub);
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
      /[^a-zA-Z0-9\(\)\[\]\{\}\s\.\,\;\=\+\-\*\/\>\<\!\@\#\$\%\^\&\_\~\`\:\'\"\|\\]/g,
      ""
    );

    // remove (vertical tab), (form feed), (line separator), (paragraph separator), and (narrow no-break space) characters
    text = text.replace(/[\u000B\u000C\u0085\u2028\u2029]/g, " ");

    return text;
  }
}
