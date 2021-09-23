import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../service/auth.service';
import {Task} from '../../../model/Task';
import {SubmissionService} from '../../../service/submission.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserTaskResult} from '../../../model/UserTaskResult';

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent implements OnInit {
  @Input() courseId: number;
  @Input() task: Task;
  @Input() taskResult: UserTaskResult = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const uid = this.authService.getToken().id;
  }
}
