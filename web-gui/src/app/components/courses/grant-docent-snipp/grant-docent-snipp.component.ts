import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../../interfaces/HttpInterfaces';
import {flatMap, map, startWith} from 'rxjs/operators';
import {DatabaseService} from '../../../service/database.service';
import {UserService} from '../../../service/user.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';"Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]; nested exception is io.jsonwebtoken.SignatureException\c JWT signature does not match locally computed signature. JWT validity cannot be asserted and should not be trusted."

@Component({
  selector: 'app-grant-docent-snipp',
  templateUrl: './grant-docent-snipp.component.html',
  styleUrls: ['./grant-docent-snipp.component.scss']
})
export class GrantDocentSnippComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @Input() course;
  @Input() docent_list: User[];
  @Input() liveUpdate: boolean;
  @Output() loadAllCourses: EventEmitter<void>;

  docentFormControl = new FormControl();
  filteredOptions: Observable<User[]>;

  // dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();
  dataSourceUsers: User[];
  showInputForDocent: boolean;
  docentInputCourseID: number;

  constructor(private db: DatabaseService, private user: UserService, private snackBar: MatSnackBar) {
    this.loadAllCourses = new EventEmitter<void>();
  }

  ngOnInit() {
    this.db.getAllUsers().pipe(
      flatMap(users => {
        this.dataSourceUsers = users;
        this.filteredOptions = this.docentFormControl.valueChanges
          .pipe(
            startWith<string | User>(''),
            map(value => typeof value === 'string' ? value : value.prename.concat(value.surname)),
            map(name => name ? this._filterDocentInput(name) : this.dataSourceUsers.slice())
          );
        return this.filteredOptions;
      })
    ).subscribe();
  }

  private _filterDocentInput(value: string): User[] {
    const filterValue = value.toLowerCase().replace(' ', '');

    return this.dataSourceUsers.filter(option => {
      return option.prename.toLowerCase().indexOf(filterValue) === 0
        || option.surname.toLowerCase().indexOf(filterValue) === 0
        || option.surname.toLowerCase().concat(option.prename.toLowerCase()).indexOf(filterValue) === 0
        || option.prename.toLowerCase().concat(option.surname.toLowerCase()).indexOf(filterValue) === 0;
    });
  }

  /**
   * Add docent to course
   * @param courseID Course, the docent will be added
   * @param key Keyboard press key 'ENTER'
   */
  addDocent(courseID: number, key: string) {
    if (key === 'Enter') {
      const selectedUser: User = this.docentFormControl.value;
      this.docentFormControl.setValue('');
      this.showInputForDocent = false;
      if (this.liveUpdate) {
        this.db.addDocentToCourse(courseID, selectedUser.user_id).subscribe(res => {
          this.loadAllCourses.emit();
        });
      } else {
        this.docent_list.push(selectedUser);
        console.log(this.docent_list);
      }
    }
  }

  get correctCourseDocent() {
    if (this.liveUpdate) {
      return this.course.course_docent;
    } else {
      return this.docent_list;
    }
  }

  /**
   * Remove docent from course
   * @param courseID Course, docent will be removed
   * @param userID The docent id
   */
  removeDocent(courseID: number, userID: number) {
    if (this.liveUpdate) {
      this.db.removeDocentFromCourse(courseID, userID).subscribe(courses => {
        this.loadAllCourses.emit();
      });
    } else {
      const hiddenUser = this.docent_list.filter((u: User) => {
        return u.user_id == userID;
      });
      console.log('here', hiddenUser );
      const i = this.docent_list.indexOf(hiddenUser[0]);
      this.docent_list.splice(i, 1);
    }
  }

  /**
   * Show only for course with right id the input
   * @param courseID The course input should be shown
   */
  showDocentInput(courseID: number) {
    this.docentInputCourseID = courseID;
    this.showInputForDocent = true;
  }

  /**
   * Shows prename and surname of users in autocomplete
   * @param user The user to show
   */
  displayFn(user?: User): string | undefined {
    return user ? user.prename + ' ' + user.surname : undefined;
  }
}
