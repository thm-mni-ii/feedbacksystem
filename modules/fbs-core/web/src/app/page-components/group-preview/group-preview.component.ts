import { Component, Input, OnInit } from "@angular/core";
import { Group } from "../../model/Group";
import { Course } from "../../model/Course";
import { CourseService } from "../../service/course.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-group-preview",
  templateUrl: "./group-preview.component.html",
  styleUrls: ["./group-preview.component.scss"],
})
export class GroupPreviewComponent implements OnInit {
  @Input() data: Group;
  course: Course;
  courseName: string;

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourseName();
  }

  loadCourseName(): void {
    this.courseService.getCourse(this.data.courseId).subscribe((course) => {
      this.course = course;
      this.courseName = course.name;
    });
  }

  /**
   * Show group in detail
   */
  goToGroup(): void {
    console.log("Navigationsdaten:", this.data.courseId, this.data.id);
    this.router.navigate(["groups", this.data.courseId, this.data.id]);
  }
}
