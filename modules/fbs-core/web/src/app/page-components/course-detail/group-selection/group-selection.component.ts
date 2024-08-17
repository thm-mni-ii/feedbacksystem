import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
import { map, mergeMap, tap } from "rxjs/operators";
import { ConfirmDialogComponent } from "../../../dialogs/confirm-dialog/confirm-dialog.component";
import { I18NextPipe } from "angular-i18next";
import { GroupDeregisterDialogComponent } from "../../../dialogs/group-deregister-dialog/group-deregister-dialog.component";
import { Participant } from "../../../model/Participant";
import { CourseService } from "../../../service/course.service";

@Component({
  selector: "app-group-selection",
  templateUrl: "./group-selection.component.html",
  styleUrls: ["./group-selection.component.scss"],
})
export class GroupSelectionComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;
  @Output() valueChosen: EventEmitter<any> = new EventEmitter();

  groups$: Observable<
    (Group & { currentMembership: number } & { participants: Participant[] })[]
  >;
  preselectedGroup: Group & { currentMembership: number } & {
    participants: Participant[];
  };
  courseId: number;
  editGroups: boolean = false;
  role: string = null;
  student: boolean = false;
  preselectionExists: boolean = false;
  selectionIsOpen: boolean;
  userId: number;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private dialog: MatDialog,
    private courseService: CourseService,
    private groupService: GroupService,
    private groupRegistrationService: GroupRegistrationService,
    private i18NextPipe: I18NextPipe
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseId = param.id;
    });
    this.userId = this.auth.getToken().id;
    this.loadGroups();
    this.role = this.auth.getToken().courseRoles[this.courseId];
    this.choose(this.preselectedGroup);
    this.getSelectionPossibility();
  }

  choose(value: Group): void {
    this.valueChosen.emit(value);
  }

  getSelectionPossibility(): void {
    this.courseService
      .getCourse(this.courseId)
      .pipe(
        map((course) => {
          const selection = course.groupSelection;
          if (selection) {
            this.selectionIsOpen = selection;
          } else {
            this.selectionIsOpen = false;
          }
        })
      )
      .subscribe();
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
    this.groups$ = this.groupService.getGroupList(this.courseId).pipe(
      mergeMap((groups: Group[]) =>
        forkJoin(
          groups.map((group) =>
            forkJoin({
              currentMembership:
                this.groupRegistrationService.getGroupMembership(
                  this.courseId,
                  group.id
                ),
              participants: this.groupRegistrationService.getGroupParticipants(
                this.courseId,
                group.id
              ),
            }).pipe(
              map(({ currentMembership, participants }) => ({
                ...group,
                currentMembership,
                participants,
              }))
            )
          )
        )
      ),
      tap((groups) => {
        const groupWithPreselection = groups.find((group) =>
          group.participants.some(
            (participant) => participant.user.id === this.userId
          )
        );
        this.preselectionExists = !!groupWithPreselection;
        this.preselectedGroup = groupWithPreselection || null;
      })
    );
  }

  createGroup() {
    this.dialog
      .open(NewGroupDialogComponent, {
        data: { cid: this.courseId, isUpdateDialog: false },
        height: "auto",
        width: "50%",
      })
      .afterClosed()
      .subscribe(
        (confirm) => {
          if (confirm.success) {
            this.loadGroups();
          }
        },
        (error) => console.error(error)
      );
  }

  manageSelection() {
    this.courseService
      .updateGroupSelection(this.courseId, !this.selectionIsOpen)
      .subscribe();
    this.getSelectionPossibility();
  }

  joinGroup(): void {
    if (this.preselectedGroup) {
      this.groupRegistrationService
        .registerGroup(
          this.courseId,
          this.preselectedGroup.id,
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

  removeGroup(): void {
    if (this.preselectedGroup) {
      this.groupRegistrationService
        .deregisterGroup(
          this.courseId,
          this.preselectedGroup.id,
          this.auth.getToken().id
        )
        .subscribe(
          () => {
            this.preselectedGroup = null;
            this.preselectionExists = false;
            this.loadGroups();
          },
          (error) => console.error(error)
        );
    } else console.error("No group pre-selected");
  }

  updateGroup(group: Group) {
    this.dialog
      .open(NewGroupDialogComponent, {
        width: "50%",
        height: "auto",
        data: {
          cid: group.courseId,
          gid: group.id,
          student: this.student,
          isUpdateDialog: true,
        },
      })
      .afterClosed()
      .subscribe(
        (confirm) => {
          if (confirm.success) {
            this.loadGroups();
          }
        },
        (error) => console.error(error)
      );
  }

  deregisterMember(group: Group): void {
    this.dialog
      .open(GroupDeregisterDialogComponent, {
        width: "25%",
        height: "auto",
        data: {
          cid: group.courseId,
          gid: group.id,
          adding: false,
        },
      })
      .afterClosed()
      .subscribe(
        () => {
          this.loadGroups();
        },
        (error) => console.error(error)
      );
  }

  derigisterAllMembers(group: Group): void {
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
            .deregisterAll(group.courseId, group.id)
            .subscribe(
              () => {
                this.loadGroups();
              },
              (error) => console.error(error)
            );
        }
      });
  }

  addMember(group: Group): void {
    this.dialog
      .open(GroupDeregisterDialogComponent, {
        width: "25%",
        height: "auto",
        data: {
          cid: group.courseId,
          gid: group.id,
          adding: true,
        },
      })
      .afterClosed()
      .subscribe(
        () => {
          this.loadGroups();
        },
        (error) => console.error(error)
      );
  }

  deleteGroup(group: Group): void {
    const title = this.i18NextPipe.transform("group.delete") + "?";
    const message =
      group.name + this.i18NextPipe.transform("group.delete.message");
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
          this.groupService.deleteGroup(group.courseId, group.id).subscribe(
            () => {
              this.loadGroups();
            },
            (error) => console.error(error)
          );
        }
      });
  }
}
