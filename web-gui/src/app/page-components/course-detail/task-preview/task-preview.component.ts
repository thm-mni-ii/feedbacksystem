import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../service/auth.service';
import {Task} from '../../../model/Task';
import {SubmissionService} from '../../../service/submission.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent implements OnInit {
  @Input() courseId: number;
  @Input() task: Task;
  status: Observable<boolean | null> = of(null);

  constructor(private authService: AuthService, private submissionService: SubmissionService) {}

  ngOnInit(): void {
    const uid = this.authService.getToken().id;
    this.status = this.submissionService.getAllSubmissions(uid, this.courseId, this.task.id)
      .pipe(map(submissions => {
        if (submissions.length === 0) {
          return <boolean>null;
        } else {
          return submissions.reduce((acc, submission) => {
            const done = submission.done;
            const finalExitCode = submission.results.reduce((acc2, value) => acc2 + value.exitCode, 0);
            return acc || done && finalExitCode === 0;
          }, false);
        }
      }));
  }
}
