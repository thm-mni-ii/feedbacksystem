import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../../service/auth.service";
import {TaskService} from "../../../service/task.service";
import {CourseService} from "../../../service/course.service";
import {Task} from "../../../model/Task";
import {Course} from "../../../model/Course";
import {Submission} from "../../../model/Submission";
import {JWTToken} from "../../../model/JWTToken";

@Component({
  selector: 'app-task-preview',
  templateUrl: './task-preview.component.html',
  styleUrls: ['./task-preview.component.scss']
})
export class TaskPreviewComponent implements OnInit {
  constructor(private route: ActivatedRoute, private dialog: MatDialog, private router: Router,
              private taskService: TaskService, private courseService: CourseService,
              private authService: AuthService) {
  }

  task: Task;
  tasks: Task[];
  course: Course;
  submissions: Submission[];
  token: JWTToken;
  submissionStatus: boolean;


  ngOnInit() {
    this.submissionStatus = null;

    this.route.params.subscribe(
      params => {
        let courseID = +params['id'];
        let taskID = params.taskid;
        this.loadInformation(courseID, taskID);
      }, error => this.router.navigate(['404'])
    );
    if (this.submissions != null) {
      this.submissionStatus = this.getStatus();
    }
    this.taskService.getAllTasks(this.course.id).subscribe(
      tasks => {
        this.tasks = tasks;
      }
    )
  }

  /**
   * function that gets initial Information from services
   * @param cid CourseID
   * @param tid TaskID
   */
  private loadInformation(cid: number, tid: number) {
    this.taskService.getTask(cid, tid).subscribe(
      task => {
        if (Object.keys(task).length == 0) {
          this.router.navigate(['404']);
        }
        this.task = task;
      }
    );
    this.courseService.getCourse(cid).subscribe(
      course => {
        if (Object.keys(course).length == 0) {
          this.router.navigate(['404']);
        }
        this.course = course;
      }
    );
    this.getSubmissions(cid, tid);
    this.token = this.authService.getToken()
  }

  getSubmissions(cid: number, tid: number) {
    this.taskService.getAllSubmissions(1, cid, tid).subscribe(
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

  /*public isAuthorized(roles: String[]) {
    // if (roles.find(role => role == 'dozent')) return true
    return true
    // return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor';
  }*/
}
