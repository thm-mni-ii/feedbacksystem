import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MathInputValue } from "../../../tool-components/math-input/math-input.component";
import { Submission } from "../../../model/Submission";

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
  @Input()
  lastSubmission?: Submission | undefined = undefined;

  results: Record<string, any> = {};
  latex: Record<string, any> = {};

  constructor() {}


  updateSubmission(field: string, value: MathInputValue) {
    this.results[field] = value.mathJson;
    this.latex[field] = value.latex;
    this.results["complete"] = this.outputFields.length > 0;
    this.update.emit({
      content: this.results,
      additionalInformation: { latex: this.latex },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.lastSubmission) return;
    const latex = this.lastSubmission.additionalInformation["latex"];
    if (!latex) return;
    console.log(this.lastSubmission);
    for (const propName in changes) {
      if (propName === "outputFields" || propName === "lastSubmission") {
        this.latex = this.outputFields.reduce((acc, val) => {
          console.log(latex[val]);
          acc[val] = latex[val] ?? "";
          return acc;
        }, {});
      }
    }
  }
}
