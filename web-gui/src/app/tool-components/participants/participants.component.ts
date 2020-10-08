import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {CourseRegistrationService} from "../../service/course-registration.service";
import {Participant} from "../../model/Participant";
import {User} from "../../model/User";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {
  @Input() courseID: number;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  columns = ['surname', 'prename', 'email', 'globalRole', 'action'];
  dataSource = new MatTableDataSource<User>();
  user: User[];
  participants: Participant[]

  constructor(private snackBar: MatSnackBar,
              private registrationService: CourseRegistrationService,) { }


  ngOnInit(): void {
    this.user = []
    this.refreshUserList();
  }

  private refreshUserList() {
    this.registrationService.getCourseParticipants(this.courseID)
      .subscribe(
      participants => {
        this.participants = participants;
        participants.map(participant => {
          this.user.push(participant.user)
        });
        this.dataSource.data = this.user;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  getRole(userID: number): String{
    // @ts-ignore
    return this.participants.find(participant => participant.user.id == userID).role.value;
  }

  /**
   * Docent selects new role for user
   * @param userID The id of user
   * @param role Selected role
   */
  roleChange(userID: number, role: string) {
    this.registrationService.registerCourse(userID, this.courseID, role)
      .subscribe(res => {
        // TODO
        if(res){
          this.snackBar.open("Benutzerrolle wurde geändert.","OK",{duration: 5000});
          this.refreshUserList()
        } else {
          this.snackBar.open("Leider gab es einen Fehler.","OK", {duration: 5000})
        }
    }, () => {
      this.snackBar.open("Leider gab es einen Fehler mit dem Update","OK", {duration: 5000})
    });
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  unregister(user: User) {
    this.snackBar.open("Soll der Benutzer ausgetragen werden?","Ja",{duration:3000}).onAction()
      .subscribe(() => {
        this.registrationService.deregisterCourse(this.courseID,user.id).subscribe(
        () => {
          this.snackBar.open("Der Benutzer " + user.prename + " " + user.surname + " wurde ausgetragen.", "OK", {duration: 5000});
          this.refreshUserList();
        });
      });
    }

  /**
   * Docent searches for user
   * @param filterValue String the admin provides to search for
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
