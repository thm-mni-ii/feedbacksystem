import { Component, OnInit } from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ReSubmissionResult, TaskLastSubmission} from "../../../interfaces/HttpInterfaces";
import {AnswerFromTestsystemDialogComponent} from "../modals/answer-from-testsystem-dialog/answer-from-testsystem-dialog.component";

@Component({
  selector: 'app-task-analyze-submissions',
  templateUrl: './task-analyze-submissions.component.html',
  styleUrls: ['./task-analyze-submissions.component.scss']
})
export class TaskAnalyzeSubmissionsComponent implements OnInit {


  courseid: number;
  userRole: string;
  taskid: number;
  submissions: TaskLastSubmission[];
  fetchingResults: {} = {};
  submissionResults = {};
  systemFailedMsg: boolean = false;

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router) { }


  ngOnInit() {
    this.courseid = parseInt(this.route.snapshot.paramMap.get("id"));
    this.taskid = parseInt(this.route.snapshot.paramMap.get("taskid"));

    this.loadUserRole();

    this.db.getTaskSubmissions(this.courseid, this.taskid).subscribe((value: TaskLastSubmission[]) => {
      this.submissions = value;
      this.submissions.forEach(subm => {
        this.fetchingResults[subm.submission_id] = false;
        this.submissionResults[subm.submission_id] = [];
        this.fetchReSubmissionResult(subm.submission_id, 0, true);
      })

    })

  }

  public isAuthorized(){
    return this.userRole === 'docent' || this.userRole === 'admin' || this.userRole === 'moderator' || this.userRole === 'tutor'
  }

  loadUserRole(){
    return this.db.getCourseDetail(this.courseid).subscribe(
      course_detail => {
        this.userRole = course_detail.role_name;
        if(!this.isAuthorized()){
          this.router.navigate(["courses",this.courseid])
        }
      }
    )
  }

  runAnalyzeForAll(){
    this.submissions.forEach(sub =>
      this.runAnalyze(sub.submission_id)
    )
  }

  runAnalyze(subid: number){
    // TODO load checker system from GUI
    this.submissionResults[subid] = [];
    this.db.reSubmitASubmission(this.taskid, subid, ['gitstatschecker']).subscribe(
      result => {
        this.fetchingResults[subid] = true;
        this.fetchReSubmissionResult(subid);
      })
  }

  fetchReSubmissionResult(subid: number, trial: number = 0, init: boolean = false){
    this.db.getReSubmissionResults(this.taskid, subid).subscribe(
      (value: ReSubmissionResult[]) => {
        let result = value.map((v: ReSubmissionResult) => v.result);
        let finishedAResults = result.filter(s => (s != null && s.length > 0));

        if (trial > 24) {
          if(!this.systemFailedMsg){
            this.dialog.open(AnswerFromTestsystemDialogComponent, {data:{no_reaction:true}});
            this.systemFailedMsg = true;
          }

          return;
        } // break the loop after 2 minutes

        if(!init && result.length > finishedAResults.length){ // results not finished yet
          // start again fetching
          setTimeout(() => this.fetchReSubmissionResult(subid, trial+1), 5000)
        } else {
          // results are finished
          value.forEach((resultSet: ReSubmissionResult) => {
            this.submissionResults[resultSet.subid].push(resultSet)
          });
          this.fetchingResults[subid] = false;
        }

      },
      error => {}
    )
  }

}
