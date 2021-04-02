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
  inputValues = [{name: 'l[m]', value: '12'}, {name: 'a[m]', value: '16'}, {name: 'b[m]', value: '12'}, {name: 'h[m]', value: '18'}];

  @Input()
  resultValues = [{name: 'm (Steigung der Tagente)'}, {name: 'x2 (Nullstelle)'}, {name: 'γ (3. Parameter von f(x))'},
    {name: 'β (2. Parameter von f(x))'}, {name: 'm (Steigung von G(x))'}, {name: 'x0 (Nullstelle von f(x))'},
    {name: 'd'}, {name: 'xD'}, {name: 'max. Durchgang'}];

  resultForm = new FormGroup(this.resultValues.reduce((acc, val) => {acc[val.name] = new FormControl(''); return acc; }, {}));

  constructor() { }

  updateSubmission(event) {
    this.update.emit({content: event});
  }
}
