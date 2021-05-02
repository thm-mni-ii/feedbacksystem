import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-submission-spreadsheet',
  templateUrl: './submission-spreadsheet.component.html',
  styleUrls: ['./submission-spreadsheet.component.scss']
})
export class SubmissionSpreadsheetComponent {
  toSubmit = '';
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  inputFields: string[][] = [];

  _outputFields: string[] = [];
  @Input()
  set outputFields(outputFields: string[]) {
    this._outputFields = outputFields;
    this.resultForm = new FormGroup(this.outputFields.reduce((acc, val) => {
      acc[val] = new FormControl('');
      return acc;
    }, {}));
  }

  get outputFields(): string[] {
    return this._outputFields;
  }
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
    content['complete'] = enteredCount === this.outputFields.length;
    this.update.emit({content});
  }
}
