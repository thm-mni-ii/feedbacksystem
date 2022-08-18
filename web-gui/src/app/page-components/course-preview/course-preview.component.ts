import { Component, Input } from "@angular/core";
import { Course } from "../../model/Course";
import { Router } from "@angular/router";

@Component({
  selector: "app-course-preview",
  templateUrl: "./course-preview.component.html",
  styleUrls: ["./course-preview.component.scss"],
})
export class CoursePreviewComponent {
  @Input() data: Course;

  constructor(private router: Router) {}

  /**
   * Show course in detail
   * @param courseID The course to see in detail
   */
  goToCourse() {
    this.router.navigate(["courses", this.data.id]); // TODO: Should be ID
  }
}
