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

export interface MathInputValue {
  mathJson?: string;
  latex?: string;
}

@Component({
  selector: "app-math-input",
  templateUrl: "./math-input.component.html",
  styleUrls: ["./math-input.component.scss"],
})
export class MathInputComponent implements OnChanges, AfterViewInit {
  @Input()
  defaultValue: MathInputValue;
  @Input()
  label: string = "";
  @Input()
  disabled: boolean = false;
  @Output()
  update: EventEmitter<MathInputValue> = new EventEmitter();
  @ViewChild("mathInput")
  private input: ElementRef;
  private touched: boolean = false;

  handleChange($event: Event) {
    if (!$event.currentTarget) return;
    const e = $event.currentTarget as any;
    const mathJson = e.expression.json;
    const latex = e.value;
    this.touched = true;
    this.update.emit({ mathJson: JSON.stringify(mathJson), latex });
  }

  ngOnChanges(): void {
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    if (!this.input) return;
    const el = this.input.nativeElement;
    el.setOptions({
      readOnly: this.disabled,
      virtualKeyboardMode: !this.disabled ? "manual" : "off",
      virtualKeyboards: "numeric roman greek",
      decimalSeparator: ",",
      keypressSound: null,
    });
    if (!this.touched && this.defaultValue) {
      if (this.defaultValue.latex) {
        el.value = this.defaultValue.latex;
      } else if (this.defaultValue.mathJson) {
        el.expression = JSON.parse(this.defaultValue.mathJson);
      }
    }
  }
}
