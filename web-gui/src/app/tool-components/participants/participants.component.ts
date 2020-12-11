import {Component, OnInit, ViewChild} from '@angular/core';
import {CourseRegistrationService} from '../../service/course-registration.service';
import {Participant} from '../../model/Participant';
import {User} from '../../model/User';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../service/user.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  courseID = 0;
  columns = ['surname', 'prename', 'email', 'globalRole', 'action'];
  dataSource = new MatTableDataSource<User>();
  user: User[];
  participants: Participant[];
  allUser: User[];
  searchedUser: User[];

  constructor(private snackBar: MatSnackBar, private userService: UserService,
              private registrationService: CourseRegistrationService,
              private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(
      param => {
        this.courseID = param.id;
        this.userService.getAllUsers().subscribe(
          user => {
            this.allUser = user;
            this.refreshUserList();
          }
        );
      }
    );
  }

  private refreshUserList() {
    this.user = [];
    this.registrationService.getCourseParticipants(this.courseID)
      .subscribe(
      participants => {
        this.participants = participants;
        participants.map(participant => {
          this.user.push(participant.user);
        });
        this.dataSource.data = this.user;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  getRole(userID: number): String {
    return this.participants.find(participant => participant.user.id === userID).role.value;
  }

  /**
   * Docent selects new role for user
   * @param userID The id of user
   * @param role Selected role
   */
  roleChange(userID: number, role: string) { // TODO
    this.registrationService.deregisterCourse(this.courseID, userID).subscribe(() => {
      this.registrationService.registerCourse(userID, this.courseID, role)
        .subscribe(res => {
          this.snackBar.open('Benutzerrolle wurde geändert.', 'OK', {duration: 5000});
          this.refreshUserList();
        }, () => {
          this.snackBar.open('Leider gab es einen Fehler mit dem Update', 'OK', {duration: 5000});
        });
    });
  }

  /**
   * User gets deleted
   * @param user The user to delete
   */
  unregister(user: User) {
    this.snackBar.open('Soll der Benutzer ausgetragen werden?', 'Ja', {duration: 3000}).onAction()
      .subscribe(() => {
        this.registrationService.deregisterCourse(this.courseID, user.id).subscribe(
        () => {
          this.snackBar.open('Der Benutzer ' + user.prename + ' ' + user.surname + ' wurde ausgetragen.', 'OK', {duration: 5000});
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

  addParticipant(user: User) {
    this.snackBar.open('Soll ' + user.prename + ' ' + user.surname + ' dem Kurs hinzugefügt werden?', 'Ja', {duration: 5000})
      .onAction().subscribe( () => {
        if (this.user.find(participant => participant.id === user.id)) {
          this.snackBar.open(user.prename + ' ' + user.surname + ' nimmt bereits an dem Kurs teil.', 'ok', {duration: 3000});
        } else {
          this.registrationService.registerCourse(user.id, this.courseID)
            .subscribe(() => {
              this.snackBar.open('Teilnehmer hinzugefügt.', 'ok', {duration: 3000});
              this.refreshUserList();
            });
        }
    });
  }

  displayFn(user?: User): string | undefined {
    return user ? user.surname : undefined;
  }
}
