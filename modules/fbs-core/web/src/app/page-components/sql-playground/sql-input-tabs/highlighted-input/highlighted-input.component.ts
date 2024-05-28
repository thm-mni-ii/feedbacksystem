import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Subscription, fromEvent } from "rxjs";
import { PrismService } from "src/app/service/prism.service";

@Component({
  selector: "app-highlighted-input",
  templateUrl: "./highlighted-input.component.html",
  styleUrls: ["./highlighted-input.component.scss"],
})
export class HighlightedInputComponent
  implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild("textArea", { static: true }) textArea!: ElementRef;
  @ViewChild("codeContent", { static: true }) codeContent!: ElementRef;
  @ViewChild("pre", { static: true }) pre!: ElementRef;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @Input() tabs: any[];
  @Input() selectedIndex: number;

  sub!: Subscription;
  highlighted = false;
  codeType = "sql";

  groupForm = new FormGroup({
    content: new FormControl(""),
  });

  titleText: any;

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  constructor(
    private prismService: PrismService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes): void {
    if (changes.selectedIndex) {
      this.listenForm();
    }
  }

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

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  updateSubmission(event) {
    let cleanedText = this.cleanText(event);

    if (cleanedText !== event) {
      this.groupForm.patchValue({ content: cleanedText });
    }

    this.update.emit({ content: event });
  }

  listenForm() {
    if (this.tabs[this.selectedIndex].content !== null) {
      this.groupForm.setValue({
        content: this.tabs[this.selectedIndex].content,
      });
    }
    this.sub = this.groupForm.valueChanges.subscribe((val: any) => {
      const modifiedContent = this.prismService.convertHtmlIntoString(
        val.content
      );

      this.renderer.setProperty(
        this.codeContent.nativeElement,
        "innerHTML",
        modifiedContent
      );

      this.highlighted = true;
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
      /[^a-zA-Z0-9üöäÄÖÜß\(\)\[\]\{\}\s\.\,\;\=\+\-\*\/\>\<\!\@\#\$\?\%\^\&\_\~\`´°²³§\:\'\"\|\\]/g,
      ""
    );

    // remove (vertical tab), (form feed), (line separator), (paragraph separator), and (narrow no-break space) characters
    text = text.replace(/[\u000B\u000C\u0085\u2028\u2029]/g, " ");

    return text;
  }
}
