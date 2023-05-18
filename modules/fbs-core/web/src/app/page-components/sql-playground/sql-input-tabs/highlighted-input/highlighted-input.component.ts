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
import { PrismService } from "src/app/service/prism.service";

@Component({
  selector: "app-highlighted-input",
  templateUrl: "./highlighted-input.component.html",
  styleUrls: ["./highlighted-input.component.scss"],
})
export class HighlightedInputComponent
  implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy
{
  @ViewChild("textArea", { static: true }) textArea!: ElementRef;
  @ViewChild("codeContent", { static: true }) codeContent!: ElementRef;
  @ViewChild("pre", { static: true }) pre!: ElementRef;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

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
    let cleanedText = this.cleanUpTextAreaRegx(event);

    //check if cleanedText is different from event -> prevent infinite loop
    //if different, update the text area
    //if (cleanedText !== event) {
    //this.groupForm.patchValue({ content: cleanedText });
    //}
    this.update.emit({ content: cleanedText });
  }

  cleanUpTextAreaRegx(sqlInput: String) {
    let temp = sqlInput.replace(/[\n\t]/g, " ");
    return temp;
  }

  listenForm() {
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

  cleanupTextarea(textToCheck: string) {
    // rule: max 80 char per line -> if more, add a line break

    const lines = textToCheck.split("\n");
    let newLines = [];

    lines.forEach((line) => {
      if (line.length > 80) {
        const newLine = line.match(/.{1,80}/g);
        newLines = [...newLines, ...newLine];
      } else {
        newLines = [...newLines, line];
      }
    });

    return newLines.join("\n");
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
}
