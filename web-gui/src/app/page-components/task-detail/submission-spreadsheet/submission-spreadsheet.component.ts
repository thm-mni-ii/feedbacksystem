import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-submission-spreadsheet',
  templateUrl: './submission-spreadsheet.component.html',
  styleUrls: ['./submission-spreadsheet.component.scss']
})
export class SubmissionSpreadsheetComponent implements OnChanges {
  toSubmit = '';
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  inputFields: string[][] = [];

  @Input()
  outputFields: string[] = [];
  @Input()
  decimals: number = 2;
  @Input()
  content: object = {};

  resultForm = new FormGroup({});

  constructor() { }

  updateSubmission() {
    const enteredCount = Object.values(this.resultForm.value).reduce((acc: number, field: string) => {
      if (field) {
        acc++;
      }
      return acc;
    }, 0);
    const content = this.resultForm.value;
    content['complete'] = this.outputFields.length > 0;
    this.update.emit({content});
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName === 'outputFields' || propName === 'content') {
        this.resultForm = new FormGroup(this.outputFields.reduce((acc, val) => {
          acc[val] = new FormControl(this.content[val] ?? '');
          return acc;
        }, {}));
      }
    }
  }
}
