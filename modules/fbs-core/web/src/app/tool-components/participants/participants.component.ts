import { Component, OnInit, ViewChild } from "@angular/core";
import { CourseRegistrationService } from "../../service/course-registration.service";
import { Participant } from "../../model/Participant";
import { User } from "../../model/User";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../service/user.service";
import { ActivatedRoute } from "@angular/router";
import { Roles } from "../../model/Roles";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { TextConfirmDialogComponent } from "src/app/dialogs/text-confirm-dialog/text-confirm-dialog.component";
import { AuthService } from "../../service/auth.service";

@Component({
  selector: "app-participants",
  templateUrl: "./participants.component.html",
  styleUrls: ["./participants.component.scss"],
})
export class ParticipantsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  courseID = 0;
  columns = ["surname", "prename", "email", "globalRole", "action"];
  dataSource = new MatTableDataSource<User>();
  user: User[] = [];
  participants: Participant[] = [];
  allUser: User[] = [];
  searchedUser: User[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog,
    private registrationService: CourseRegistrationService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.courseID = parseInt(param.id, 10) || Number(param.id) || 0;
      this.refreshUserList();
      this.userService.getAllUsers().subscribe(
        (users) => {
          this.allUser = users || [];
          this.searchedUser = users || [];
        },
        (error) => {
          console.warn(
            "Could not load all users for participant search:",
            error
          );
          this.allUser = [];
          this.searchedUser = [];
        }
      );
    });
  }

  private refreshUserList() {
    this.user = [];
    this.registrationService.getCourseParticipants(this.courseID).subscribe(
      (participants) => {
        this.participants = participants || [];
        this.user = this.participants
          .map((participant) => participant.user)
          .filter((u): u is User => !!u);
        this.dataSource.data = this.user;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (user: User, field: string) => {
          if (field === "globalRole") {
            return Roles.CourseRole.getSortOrder(this.getRole(user.id));
          }
          return (user as any)[field];
        };
      },
      (error) => {
        console.error("Error loading course participants:", error);
        this.snackBar.open("Fehler beim Laden der Teilnehmerliste.", "OK", {
          duration: 5000,
        });
      }
    );
  }

  getRole(userID: number): string {
    const participant = this.participants?.find((p) => p.user?.id === userID);
    if (!participant || !participant.role) {
      return Roles.CourseRole.STUDENT;
    }
    if (typeof participant.role === "string") {
      return participant.role;
    }
    return (participant.role as any).value || Roles.CourseRole.STUDENT;
  }

  /**
   * Docent selects new role for user
   * @param userID The id of user
   * @param role Selected role
   */
  roleChange(userID: number, role: string) {
    this.registrationService
      .registerCourse(userID, this.courseID, role)
      .subscribe(
        () => {
          this.snackBar.open("Benutzerrolle wurde geändert.", "OK", {
            duration: 5000,
          });
          this.refreshUserList();
          try {
            const currentUserId = this.auth.getToken()?.id;
            if (userID === currentUserId) {
              this.auth.fetchCourseRoles(currentUserId).subscribe();
            }
          } catch {
            // ignore
          }
        },
        (error) => {
          console.error("Failed to update role:", error);
          this.snackBar.open(
            "Leider gab es einen Fehler mit dem Update.",
            "OK",
            { duration: 5000 }
          );
        }
      );
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  unregister(user: User) {
    this.openConfirmDialog("Soll der Benutzer ausgetragen werden?").subscribe(
      (result) => {
        if (result === true) {
          this.registrationService
            .deregisterCourse(user.id, this.courseID)
            .subscribe(
              () => {
                this.snackBar.open(
                  "Der Benutzer " +
                    (user.prename || "") +
                    " " +
                    (user.surname || "") +
                    " wurde ausgetragen.",
                  "OK",
                  { duration: 5000 }
                );
                this.refreshUserList();
                try {
                  const currentUserId = this.auth.getToken()?.id;
                  if (user.id === currentUserId) {
                    this.auth.fetchCourseRoles(currentUserId).subscribe();
                  }
                } catch {
                  // ignore
                }
              },
              (error) => {
                console.error("Failed to unregister user:", error);
                this.snackBar.open(
                  "Fehler beim Austragen des Benutzers.",
                  "OK",
                  {
                    duration: 5000,
                  }
                );
              }
            );
        }
      }
    );
  }

  unregisterStudent() {
    this.openTextConfirmDialog(
      "Sollen wirklich alle Studierenden ausgetragen werden?",
      "Diese Aktion kann nicht rückgängig gemacht werden.",
      "Delete Students"
    ).subscribe((result) => {
      if (result === true) {
        this.registrationService
          .deregisterRole(this.courseID, Roles.CourseRole.STUDENT)
          .subscribe(
            () => {
              this.snackBar.open("Alle Studierenden wurden entfernt.", "OK", {
                duration: 3000,
              });
              this.refreshUserList();
            },
            (error) => {
              console.error("Failed to unregister students:", error);
              this.snackBar.open(
                "Fehler beim Entfernen der Studierenden.",
                "OK",
                {
                  duration: 5000,
                }
              );
            }
          );
      }
    });
  }

  unregisterTutor() {
    this.openTextConfirmDialog(
      "Sollen wirklich alle Tutoren ausgetragen werden?",
      "Diese Aktion kann nicht rückgängig gemacht werden.",
      "Delete Tutors"
    ).subscribe((result) => {
      if (result === true) {
        this.registrationService
          .deregisterRole(this.courseID, Roles.CourseRole.TUTOR)
          .subscribe(
            () => {
              this.snackBar.open("Alle Tutoren wurden entfernt.", "OK", {
                duration: 3000,
              });
              this.refreshUserList();
            },
            (error) => {
              console.error("Failed to unregister tutors:", error);
              this.snackBar.open("Fehler beim Entfernen der Tutoren.", "OK", {
                duration: 5000,
              });
            }
          );
      }
    });
  }

  /**
   * Docent searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    const search = (filterValue || "").trim().toLowerCase();
    this.dataSource.filter = search;
    if (!this.allUser) {
      this.searchedUser = [];
      return;
    }
    this.searchedUser = this.allUser.filter((user) => {
      return (
        (user.prename || "").toLowerCase().includes(search) ||
        (user.surname || "").toLowerCase().includes(search) ||
        (user.email || "").toLowerCase().includes(search) ||
        (user.username || "").toLowerCase().includes(search)
      );
    });
  }

  addParticipant(user: User) {
    if (!user || !user.id) {
      return;
    }
    this.openConfirmDialog(
      "Soll " +
        (user.prename || "") +
        " " +
        (user.surname || "") +
        " dem Kurs hinzugefügt werden?"
    ).subscribe((result) => {
      if (result === true) {
        if (this.user.find((participant) => participant.id === user.id)) {
          this.snackBar.open(
            (user.prename || "") +
              " " +
              (user.surname || "") +
              " nimmt bereits an dem Kurs teil.",
            "OK",
            { duration: 5000 }
          );
        } else {
          this.registrationService
            .registerCourse(user.id, this.courseID, Roles.CourseRole.STUDENT)
            .subscribe(
              () => {
                this.snackBar.open(
                  "Teilnehmende Personen wurden hinzugefügt.",
                  "OK",
                  { duration: 5000 }
                );
                this.refreshUserList();
              },
              (error) => {
                console.error("Failed to add participant:", error);
                this.snackBar.open(
                  "Fehler beim Hinzufügen des Teilnehmers.",
                  "OK",
                  {
                    duration: 5000,
                  }
                );
              }
            );
        }
      }
    });
  }

  unregisterAll() {
    this.openTextConfirmDialog(
      "Möchten Sie wirklich alle teilnehmenden Personen austragen?",
      "Diese Aktion kann nicht rückgängig gemacht werden.",
      "Delete All"
    ).subscribe((result) => {
      if (result === true) {
        this.registrationService.deregisterAll(this.courseID).subscribe(
          () => {
            this.snackBar.open(
              "Alle teilnehmenden Personen wurden entfernt.",
              "OK",
              { duration: 3000 }
            );
            this.refreshUserList();
          },
          (error) => {
            console.error("Failed to unregister all:", error);
            this.snackBar.open(
              "Fehler beim Entfernen aller Teilnehmenden.",
              "OK",
              {
                duration: 5000,
              }
            );
          }
        );
      }
    });
  }

  displayFn(user?: User): string | undefined {
    return user
      ? `${user.prename || ""} ${user.surname || ""}`.trim()
      : undefined;
  }
  private openConfirmDialog(message: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: message,
        buttonText: {
          ok: "Ok",
          cancel: "Abbrechen",
        },
      },
    });
    return dialogRef.afterClosed();
  }

  private openTextConfirmDialog(
    title: string,
    message: string,
    textToRepeat: string
  ) {
    const dialogRef = this.dialog.open(TextConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
        textToRepeat: textToRepeat,
      },
    });
    return dialogRef.afterClosed();
  }
}
