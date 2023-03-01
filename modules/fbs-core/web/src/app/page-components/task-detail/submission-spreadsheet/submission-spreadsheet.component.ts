import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";

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

  constructor() {}

  updateSubmission(field: string, value: string) {
    this.results[field] = value;
    this.results["complete"] = this.outputFields.length > 0;
    this.update.emit({ content: this.results });
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
