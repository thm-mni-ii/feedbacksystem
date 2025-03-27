import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  Renderer2,
  ViewChild,
  SimpleChanges,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { PrismService } from "src/app/service/prism.service";

@Component({
  selector: "app-code-editor",
  templateUrl: "./code-editor.component.html",
  styleUrls: ["./code-editor.component.scss"],
})
export class CodeEditorComponent implements OnDestroy, AfterViewInit, OnChanges {
  @ViewChild("textArea") textArea!: ElementRef;
  @ViewChild("codeContent") codeContent!: ElementRef;

  @Input() content: string = ''; 
  @Input() index!: number;
  @Input() codeType: string = "javascript"; 

  @Output() contentChange = new EventEmitter<string>();
  @Output() update = new EventEmitter<string>();

  subs: Subscription[] = [];
  viewInitialized = false; 

  groupForm = new FormGroup({
    content: new FormControl(""),
  });

  private lastUpdated: string = "";

  get contentControl() {
    return this.groupForm.get("content")?.value;
  }

  constructor(
    private prismService: PrismService,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    this.viewInitialized = true; 
    this.listenForm();
    this.safeRender(this.content);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content && this.viewInitialized && changes.content.previousValue !== changes.content.currentValue) {
      this.groupForm.patchValue({ content: this.content }, { emitEvent: false });
      this.safeRender(this.content);
    }
  }

  private unsubscribe() {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.subs = [];
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  listenForm() {
    this.subs.push(
      this.groupForm.valueChanges
        .pipe(map((val: any) => val.content))
        .subscribe((content: string) => {
          if (content !== this.content) {
            this.content = content;
            this.contentChange.emit(content);
            this.safeRender(content);
          }
        })
    );
  }

  private safeRender(content: string) {
    if (!this.codeContent) {
      return;
    }
    this.render(content);
  }

  private render(content: string) {
    if (!this.codeContent) {
      return;
    }

    const modifiedContent = this.prismService.convertHtmlIntoString(content);
    this.renderer.setProperty(this.codeContent.nativeElement, "innerHTML", modifiedContent);

    if (content !== this.groupForm.get('content')?.value) {
      this.groupForm.setValue({ content });
    }

    this.update.emit(content); 

    this.prismService.highlight(this.codeContent.nativeElement);
  }

  onCodeEditorInput(event: Event) {
    const content = (event.target as HTMLTextAreaElement).value;
    this.groupForm.patchValue({ content }, { emitEvent: true });
  }

  onTab(event: KeyboardEvent) {
    event.preventDefault();
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart!;
    const end = textarea.selectionEnd!;

    const updatedContent =
      this.groupForm.get("content")?.value.substring(0, start) + "\t" + this.groupForm.get("content")?.value.substring(end);

    this.groupForm.patchValue({
      content: updatedContent,
    });

    textarea.selectionStart = textarea.selectionEnd = start + 1;
  }

  onContentChange(updatedContent: string) {
    this.content = updatedContent;
    this.contentChange.emit(this.content); 
  }
}
