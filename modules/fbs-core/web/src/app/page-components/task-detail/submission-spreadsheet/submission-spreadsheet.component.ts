import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MathInputValue } from "../../../tool-components/math-input/math-input.component";

@Component({
  selector: "app-submission-spreadsheet",
  templateUrl: "./submission-spreadsheet.component.html",
  styleUrls: ["./submission-spreadsheet.component.scss"],
})
export class SubmissionSpreadsheetComponent implements OnChanges {
  toSubmit = "";
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  inputFields: string[][] = [];

  @Input()
  outputFields: string[] = [];
  @Input()
  decimals: number = 2;
  @Input()
  content: object = {};

  results: Record<string, any> = {};
  latex: Record<string, any> = {};

  constructor() {}

  updateSubmission(field: string, value: MathInputValue) {
    this.results[field] = value.mathJson;
    this.results[field] = value.latex;
    this.results["complete"] = this.outputFields.length > 0;
    this.update.emit({
      content: this.results,
      additionalInformation: { latex: this.latex },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName === "outputFields" || propName === "content") {
        this.results = this.outputFields.reduce((acc, val) => {
          acc[val] = this.content[val] ?? "";
          return acc;
        }, {});
      }
    }
  }
}
