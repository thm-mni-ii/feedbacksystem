import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { EvaluationUserResults } from "../../../../model/EvaluationUserResults";
import { ActivatedRoute } from "@angular/router";
import { CourseResultsService } from "../../../../service/course-results.service";
import { Requirement } from "../../../../model/Requirement";
import { CourseResult } from "../../../../model/CourseResult";

@Component({
  selector: "app-evaluation-results",
  templateUrl: "./evaluation-results.component.html",
  styleUrls: ["./evaluation-results.component.scss"],
})
export class EvaluationResultsComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;

  evaluationUserResults: Observable<EvaluationUserResults[]>;
  courseResults: Observable<CourseResult[]>;
  courseId: number;
  showDetails: boolean;
  opened = -1;
  showPoints = false;

  constructor(
    private route: ActivatedRoute,
    private courseResultService: CourseResultsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseId = param.id;
      this.courseResults = this.courseResultService.getAllResults(
        this.courseId
      );
      this.evaluationUserResults =
        this.courseResultService.getRequirementCourseResults(this.courseId);
    });
  }

  toggleDetails(item: number) {
    // Only opens clicked category
    if (this.opened === item) {
      this.opened = -1;
    } else {
      this.opened = item;
    }
    // this.showDetails = !this.showDetails;
  }

  /*filterContainer(reqId: number) {
    return this.evaluationUserResults.subscribe(result => )
  }*/
}
