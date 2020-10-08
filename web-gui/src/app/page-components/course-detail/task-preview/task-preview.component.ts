import {Component, Input} from '@angular/core';
import {AuthService} from "../../../service/auth.service";
import {Task} from "../../../model/Task";
import {SubmissionService} from "../../../service/submission.service";
import {Observable, of} from "rxjs"

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent {
  @Input() courseId: number
  @Input() task: Task

  constructor(private authService: AuthService, private submissionService: SubmissionService) {}

  submissionStatus(): Observable<boolean> {
    return of(null)
  }
}
