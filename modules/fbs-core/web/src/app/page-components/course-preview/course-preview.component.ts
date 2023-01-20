import { Component, Input, OnInit } from "@angular/core";
import { Course } from "../../model/Course";
import { Router } from "@angular/router";

@Component({
  selector: "app-course-preview",
  templateUrl: "./course-preview.component.html",
  styleUrls: ["./course-preview.component.scss"],
})
export class CoursePreviewComponent implements OnInit {
  @Input() data: Course;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  /**
   * Show course in detail
   */
  goToCourse() {
    this.router.navigate(["courses", this.data.id]); // TODO: Should be ID
  }
}
