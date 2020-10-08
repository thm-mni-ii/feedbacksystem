import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../../service/auth.service";
import {CourseService} from "../../../service/course.service";
import {Task} from "../../../model/Task";
import {Submission} from "../../../model/Submission";
import {SubmissionService} from "../../../service/submission.service";

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent implements OnInit {
  @Input() courseId: number
  @Input() task: Task

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private router: Router,
              private submissionService: SubmissionService, private courseService: CourseService,
              private authService: AuthService) {
  }

  submissions: Submission[];
  submissionStatus: boolean;

  ngOnInit() {
    this.submissionStatus = null;
    this.getSubmissions(this.courseId, this.task.id)
    if (this.submissions != null) {
      this.submissionStatus = this.getStatus();
    }
  }

  getSubmissions(cid: number, tid: number) {
    this.submissionService.getAllSubmissions(this.authService.getToken().id, cid, tid).subscribe(
      submissions => {
        // TODO: error handling
        if (submissions != null) {
          this.submissions = submissions;
        } else this.submissions = null
      }
    );
  }

  // true if the user has passed the task successfully
  private getStatus(): boolean {
    if (this.submissions.length == 0) return null
    for (let sub of this.submissions) {
      if (!sub.done || sub.results.find(element => element.exitCode != 0)) return false
    }
    return true
  }
}

