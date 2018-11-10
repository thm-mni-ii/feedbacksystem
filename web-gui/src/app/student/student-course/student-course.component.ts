import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";

/**
 * Component for showing a specific course and his tasks.
 * Students can submit solutions here.
 */
@Component({
  selector: 'app-student-course',
  templateUrl: './student-course.component.html',
  styleUrls: ['./student-course.component.scss']
})
export class StudentCourseComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute) {
  }

  private sub: Subscription;
  id: number;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id'];
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }


}
