import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Task} from "../../model/Task";

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent implements OnInit {
  @Input() usage: String;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  private submissionFile: any;

  constructor() { }

  ngOnInit(): void {
  }

  updateSubmissionFile(event) {
    this.submissionFile = event.addedFiles
    this.update.emit({content: this.submissionFile[0]})
    // TODO: muss noch generisch gemacht werden
  }
}
