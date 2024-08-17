import { Component, Inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { GroupRegistrationService } from "../../service/group-registration.sevice";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Participant } from "../../model/Participant";
import { Group } from "../../model/Group";
import { GroupService } from "../../service/group.service";
import { CourseRegistrationService } from "../../service/course-registration.service";

@Component({
  selector: "app-group-deregister-dialog",
  templateUrl: "./group-deregister-dialog.component.html",
  styleUrls: ["./group-deregister-dialog.component.scss"],
})
export class GroupDeregisterDialogComponent implements OnInit {
  members$: Observable<Participant[]>;
  group$: Observable<Group>;
  groupName: string;

  constructor(
    private groupRegistrationService: GroupRegistrationService,
    private courseRegistrationService: CourseRegistrationService,
    private groupService: GroupService,
    public dialogRef: MatDialogRef<GroupDeregisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cid: number;
      gid: number;
      adding: boolean;
    }
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.group$ = this.groupService.getGroup(this.data.cid, this.data.gid);
    this.group$.subscribe((group: Group) => {
      this.groupName = group.name;
    });
  }

  loadMembers(): void {
    if (this.data.adding) {
      this.members$ = this.courseRegistrationService.getCourseParticipants(
        this.data.cid
      );
    } else {
      this.members$ = this.groupRegistrationService.getGroupParticipants(
        this.data.cid,
        this.data.gid
      );
    }
  }

  removeMember(member: Participant): void {
    this.groupRegistrationService
      .deregisterGroup(this.data.cid, this.data.gid, member.user.id)
      .subscribe(
        () => {
          this.loadMembers();
        },
        (error) => {
          console.error(error);
        }
      );
  }

  addMember(member: Participant): void {
    this.groupRegistrationService
      .registerGroup(this.data.cid, this.data.gid, member.user.id)
      .subscribe(
        () => {
          this.loadMembers();
        },
        (error) => {
          console.error(error);
        }
      );
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
