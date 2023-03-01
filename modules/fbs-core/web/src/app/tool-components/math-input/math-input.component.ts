import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-math-input",
  templateUrl: "./math-input.component.html",
  styleUrls: ["./math-input.component.scss"],
})
export class MathInputComponent implements OnChanges, AfterViewInit {
  @Input()
  defaultValue: string;
  @Input()
  label: string = "";
  @Input()
  disabled: boolean = false;
  @Output()
  update: EventEmitter<string> = new EventEmitter();
  @ViewChild("mathInput")
  private input: ElementRef;
  private touched: boolean = false;

  handleChange($event: Event) {
    if (!$event.currentTarget) return;
    const mathJson = ($event.currentTarget as any).expression.json;
    this.touched = true;
    this.update.emit(JSON.stringify(mathJson));
  }

  ngOnChanges(): void {
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    if (!this.input) return;
    const el = this.input.nativeElement;
    if (!this.touched && this.defaultValue) {
      el.expression = JSON.parse(this.defaultValue);
    }
    el.setOptions({
      readOnly: this.disabled,
      virtualKeyboardMode: !this.disabled ? "manual" : "off",
      virtualKeyboards: "numeric roman greek",
      decimalSeparator: ",",
    });
  }
}
