import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent implements OnInit {
  private submissionFile: any;
  private update: any;
  private task: any;

  constructor() { }

  ngOnInit(): void {
  }

  updateSubmissionFile(event) {
    this.submissionFile = event.addedFiles
    this.update.emit({taskid: this.task.task_id, content: this.submissionFile[0]})
    // TODO: muss noch generisch gemacht werden
  }
}
