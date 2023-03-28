import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-new-checker-page",
  templateUrl: "./new-checker-page.component.html",
  styleUrls: ["./new-checker-page.component.scss"],
})
export class NewCheckerPageComponent implements OnInit {
  courseId: number;
  taskId: number;
  step: number;
  selectedChecker: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.step = 1;
    this.route.params.subscribe((params) => {
      if (params) {
        this.courseId = params.id;
        this.taskId = params.tid;
      }
    });
  }

  increaseStep() {
    this.step++;
  }

  decreaseStep() {
    this.step--;
  }
}
