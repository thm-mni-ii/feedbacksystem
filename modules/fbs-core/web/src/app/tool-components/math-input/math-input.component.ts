import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-math-input",
  templateUrl: "./math-input.component.html",
  styleUrls: ["./math-input.component.scss"],
})
export class MathInputComponent {
  @Input()
  label: string;
  @Input()
  value: string;
  @Output()
  update: EventEmitter<string> = new EventEmitter();
  @ViewChild("mathInput")
  input: ElementRef;

  handleChange($event: Event) {
    const mathJson = ($event.currentTarget as any).getValue("math-json");
    this.update.emit(mathJson);
  }
}
