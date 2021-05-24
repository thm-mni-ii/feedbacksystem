import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {EvaluationUserResults} from '../../../../model/EvaluationUserResults';
import {ActivatedRoute} from '@angular/router';
import {CourseResultsService} from '../../../../service/course-results.service';
import {Requirement} from '../../../../model/Requirement';
import {CourseResult} from '../../../../model/CourseResult';
import {EvaluationContainerResult} from "../../../../model/EvaluationContainerResult";

@Component({
  selector: 'app-evaluation-results',
  templateUrl: './evaluation-results.component.html',
  styleUrls: ['./evaluation-results.component.scss']
})
export class EvaluationResultsComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;

  evaluationUserResults: Observable<EvaluationUserResults[]> = of();
  courseResults: Observable<CourseResult[]> = of();
  courseId: number;
  showDetails: boolean;
  opened = -1;
  containers: EvaluationContainerResult[] = [];
  log(val) { console.log(val); }

  constructor(private route: ActivatedRoute,
              private courseResultService: CourseResultsService) { }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.courseId = param.id;
      this.courseResults = this.courseResultService.getAllResults(this.courseId);
      this.evaluationUserResults = this.courseResultService.getRequirementCourseResults(this.courseId);
      this.evaluationUserResults.subscribe(results => console.log(results));
      this.evaluationUserResults.subscribe(results => results[0].containerResults.forEach(r => this.containers.push(r.container)));
    });

  }

  toggleDetails(item: number) {
    // Only opens clicked category
    if (this.opened === 0) {
      this.opened = -1;
    } else if ((this.opened > 0) && (this.opened === this.opened)) {
      this.opened = this.opened - (this.opened + 1);
    } else {
      this.opened = item;
    }
    // this.showDetails = !this.showDetails;
  }

}
