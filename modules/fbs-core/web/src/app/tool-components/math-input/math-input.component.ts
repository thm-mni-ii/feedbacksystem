import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from "@angular/core";

@Component({
  selector: "app-math-input",
  templateUrl: "./math-input.component.html",
  styleUrls: ["./math-input.component.scss"],
})
export class MathInputComponent implements OnChanges {
  @Input()
  label: string;
  @Input()
  value: string;
  @Output()
  update: EventEmitter<string> = new EventEmitter();
  @ViewChild("mathInput")
  input: ElementRef;



  handleChange($event: Event) {
    this.update.emit(($event.currentTarget as HTMLInputElement).value)
  }

  ngOnChanges(): void {
    /*(this.input as any).setOptions({
      virtualKeyboardMode: "manual",
    });*/
  }
}
