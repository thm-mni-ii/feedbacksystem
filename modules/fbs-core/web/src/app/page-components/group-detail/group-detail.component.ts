import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { Group } from "../../model/group";
import { GroupService } from "../../service/group.service";
import { ActivatedRoute } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";

@Component({
  selector: "app-group-detail",
  templateUrl: "./group-detail.component.html",
  styleUrls: ["./group-detail.component.scss"],
})
export class GroupDetailComponent implements OnInit {
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private titlebar: TitlebarService
  ) {}
  courseID: number;
  groupID: number;
  group$: Observable<Group> = of();

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseID = param.courseId;
      this.groupID = param.id;
      this.loadGroup();
    });
  }

  loadGroup(): void {
    this.group$ = this.groupService.getGroup(this.courseID, this.groupID);
    this.group$.subscribe((group) => {
      this.titlebar.emitTitle(group.name);
    });
  }

  navigateToKanban() {
    window.location.href = "http://localhost:3000/";
  }
}
