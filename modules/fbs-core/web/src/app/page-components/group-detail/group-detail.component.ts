import { Component, Inject, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";

import { GroupService } from "../../service/group.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { Roles } from "../../model/Roles";
import { AuthService } from "../../service/auth.service";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { GroupRegistrationService } from "../../service/group-registration.sevice";
import { Group } from "../../model/Group";
import {
  I18NEXT_SERVICE,
  I18NextPipe,
  ITranslationService,
} from "angular-i18next";
import { mergeMap } from "rxjs/operators";
import { Course } from "../../model/Course";
import { CourseService } from "../../service/course.service";

@Component({
  selector: "app-group-detail",
  templateUrl: "./group-detail.component.html",
  styleUrls: ["./group-detail.component.scss"],
})
export class GroupDetailComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private groupService: GroupService,
    private groupRegistrationService: GroupRegistrationService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private titlebar: TitlebarService,
    private i18NextPipe: I18NextPipe,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}
  courseID: number;
  groupID: number;
  group$: Observable<Group> = of();
  role: string = null;
  course$: Observable<Course> = of();

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseID = param.courseId;
      this.groupID = param.id;
      this.loadGroup();
    });
    this.role = this.auth.getToken().courseRoles[this.courseID];
  }

  derigisterAllMembers(): void {
    const title = this.i18NextPipe.transform("group.deregister.all") + "?";
    const message = this.i18NextPipe.transform("group.deregister.all.message");

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: title,
          message: message,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.groupRegistrationService
            .deregisterAll(this.courseID, this.groupID)
            .subscribe(
              () => {
                this.router.navigate(["/groups"]).then();
              },
              (error) => console.error(error)
            );
        }
      });
  }

  exitGroup(): void {
    const title = this.i18NextPipe.transform("group.deregister") + "?";
    const message = this.i18NextPipe.transform("group.deregister.message");

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: title,
          message: message,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.groupRegistrationService
            .deregisterGroup(
              this.courseID,
              this.groupID,
              this.auth.getToken().id
            )
            .subscribe(
              () => {
                this.router.navigate(["/groups"]).then();
              },
              (error) => console.error(error)
            );
        }
      });
  }

  deleteGroup() {
    this.group$.subscribe((group) => {
      const groupName = group.name;
      const title = this.i18NextPipe.transform("group.delete") + "?";
      const message =
        groupName + this.i18NextPipe.transform("group.delete.message");
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: title,
            message: message,
          },
        })
        .afterClosed()
        .pipe(
          mergeMap((confirmed) => {
            if (confirmed) {
              return this.groupService.deleteGroup(this.courseID, this.groupID);
            } else {
              return of();
            }
          })
        )
        .subscribe(
          () => {
            this.router.navigate(["/groups"]).then();
          },
          (error) => console.error(error)
        );
    });
  }

  loadGroup(): void {
    this.group$ = this.groupService.getGroup(this.courseID, this.groupID);
    this.group$.subscribe((group) => {
      this.course$ = this.courseService.getCourse(group.courseId);
      this.course$.subscribe((course) => {
        this.titlebar.emitTitle(`${group.name} - ${course.name}`);
      });
    });
  }

  navigateToKanban() {
    window.location.href = "http://localhost:3000/";
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole = token.courseRoles[this.courseID];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }
}
