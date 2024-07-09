import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../service/auth.service";
import { forkJoin, Observable } from "rxjs";
import { Requirement } from "../../../model/Requirement";
import { MatDialog } from "@angular/material/dialog";
import { Roles } from "../../../model/Roles";
import { NewGroupDialogComponent } from "../../../dialogs/new-group-dialog/new-group-dialog.component";
import { Group } from "../../../model/Group";
import { GroupService } from "../../../service/group.service";
import { GroupRegistrationService } from "../../../service/group-registration.sevice";
import { map, mergeMap } from "rxjs/operators";

@Component({
  selector: "app-group-selection",
  templateUrl: "./group-selection.component.html",
  styleUrls: ["./group-selection.component.scss"],
})
export class GroupSelectionComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;

  groups$: Observable<(Group & { currentMembership: number })[]>;
  selectedGroup: Group;
  courseId: number;
  editGroups: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private dialog: MatDialog,
    private groupService: GroupService,
    private groupRegistrationService: GroupRegistrationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseId = param.id;
    });
    this.loadGroups();
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole = token.courseRoles[this.courseId];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }

  loadGroups(): void {
    this.groups$ = this.groupService
      .getGroupList(this.courseId)
      .pipe(
        mergeMap((groups: Group[]) =>
          forkJoin(
            groups.map((group) =>
              this.groupRegistrationService
                .getGroupMembership(this.courseId, group.id)
                .pipe(
                  map((currentMembership) => ({ ...group, currentMembership }))
                )
            )
          )
        )
      );
  }

  createGroup() {
    this.dialog
      .open(NewGroupDialogComponent, {
        data: { cid: this.courseId },
        height: "auto",
        width: "50%",
      })
      .afterClosed()
      .subscribe(
        () => {
          this.loadGroups();
        },
        (error) => console.error(error)
      );
  }

  joinGroup(): void {
    if (this.selectedGroup) {
      this.groupRegistrationService
        .registerGroup(
          this.courseId,
          this.selectedGroup.id,
          this.auth.getToken().id
        )
        .subscribe(
          () => {
            this.loadGroups();
          },
          (error) => console.error(error)
        );
    } else console.error("No group selected");
  }
}
