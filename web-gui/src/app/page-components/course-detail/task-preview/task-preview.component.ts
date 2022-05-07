import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../service/auth.service';
import {Task} from '../../../model/Task';
import {UserTaskResult} from '../../../model/UserTaskResult';
import {TaskService} from '../../../service/task.service';

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent implements OnInit {
  @Input() courseId: number;
  @Input() task: Task;
  @Input() taskResult: UserTaskResult = null;


   role: string = null;

  constructor(private authService: AuthService,
              private auth: AuthService,
              private taskService: TaskService) {
  }

  ngOnInit(): void {
    const uid = this.authService.getToken().id;

     this.role = this.auth.getToken().courseRoles[this.courseId];
  }


  downloadTask(event) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    this.taskService.downloadTask(this.courseId, this.task.id, this.task.name);
  }
}
