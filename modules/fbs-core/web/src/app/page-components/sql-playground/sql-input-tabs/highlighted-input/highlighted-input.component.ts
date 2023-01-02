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
  @ViewChild("textArea", { static: true })
  textArea!: ElementRef;
  @ViewChild("codeContent", { static: true })
  codeContent!: ElementRef;
  @ViewChild("pre", { static: true })
  pre!: ElementRef;
  toSubmit = "";
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
    this.update.emit({ content: event });
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
}
