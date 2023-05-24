import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { TitlebarService } from "../../../service/titlebar.service";
import { ActivatedRoute } from "@angular/router";
import { CourseResultsService } from "../../../service/course-results.service";
import { CourseResult } from "../../../model/CourseResult";
import { Task } from "../../../model/Task";
import { SubmissionService } from "../../../service/submission.service";
import { AllSubmissionsComponent } from "../../../dialogs/all-submissions/all-submissions.component";
import { MatDialog } from "@angular/material/dialog";
import { TaskPointsService } from "../../../service/task-points.service";
import { Requirement } from "../../../model/Requirement";
import { mergeAll, filter } from "rxjs/operators";

/**
 * Matrix for every course docent a has
 */
@Component({
  selector: "app-course-results",
  templateUrl: "./course-results.component.html",
  styleUrls: ["./course-results.component.scss"],
})
export class CourseResultsComponent implements OnInit {
  constructor(
    private courseResultService: CourseResultsService,
    private tb: TitlebarService,
    private route: ActivatedRoute,
    private submissionService: SubmissionService,
    private dialog: MatDialog,
    private taskPointsService: TaskPointsService
  ) {}
  courseId: number;
  courseResults: Observable<CourseResult[]> = of();
  tasks: Observable<Task[]> = of();
  requirements: Observable<Requirement[]> = of();
  requirementTaskNames: void;
  allBonusPoints: Observable<Number[]>;
  courseBonusPoints = 0;
  results;
  allCourseResults: Observable<CourseResult[]> = of();
  displayedCourseResults: Observable<CourseResult[]> = of();
  toggle: boolean = true;

  ngOnInit(): void {
    this.tb.emitTitle("Dashboard");
    this.route.params.subscribe((param) => {
      this.courseId = param.id;
      this.allCourseResults = this.courseResultService.getAllResults(
        this.courseId
      );
      this.courseResults = this.courseResultService
        .getAllResults(this.courseId)
        .pipe(
          map((courseResults) =>
            courseResults.filter((result) =>
              result.results.some((res) => res.attempts !== 0)
            )
          )
        );

      this.displayedCourseResults = this.courseResults;
      this.tasks = this.courseResults.pipe(
        map((results) =>
          results.length === 0
            ? []
            : results[0].results.map((result) => result.task)
        )
      );
      this.requirements = this.taskPointsService.getAllRequirements(
        this.courseId
      );
      // this.requirementTaskNames = this.requirements.pipe(map(bp => bp[0].tasks.map(task => task.name)));
    });
    // TODO: material progress spinner (cause the page might load for a while)
  }

  toggleResults() {
    if (this.toggle) {
      this.displayedCourseResults = this.courseResults;
    } else {
      this.displayedCourseResults = this.allCourseResults;
    }
  }

  downloadResults() {
    // TODO
    // let data: Object[]
    // this.tasks
    //   .subscribe(tasks => {
    //     const taskNames: String[] = tasks.map(task => task.name)
    //     console.log(taskNames)
    //     this.courseResults.subscribe(results => {
    //      const temp = results.map(res => {})
    //     })
    //   })
  }

  showResult(uid: number, cid: number, tid: number) {
    const task = this.tasks.pipe(
      mergeAll(),
      filter((t) => t.id === tid)
    );
    this.submissionService.getAllSubmissions(uid, cid, tid).subscribe((res) => {
      task.subscribe((t) => {
        this.dialog.open(AllSubmissionsComponent, {
          width: "100%",
          data: {
            submission: res,
            context: { uid, cid, tid },
            isText: t.mediaType === "text/plain",
          },
        });
      });
    });
    // TODO: show results
  }
}
