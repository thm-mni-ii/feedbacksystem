import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DatabaseService} from '../../../service/database.service';
import {UserService} from '../../../service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSort} from '@angular/material/sort';
import {flatMap, map, startWith} from 'rxjs/operators';
import {User} from '../../../interfaces/HttpInterfaces';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-grant-tutor-snipp',
  templateUrl: './grant-tutor-snipp.component.html',
  styleUrls: ['./grant-tutor-snipp.component.scss']
})
export class GrantTutorSnippComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @Input() course;
  @Input() liveUpdate: boolean;
  @Output() loadAllCourses: EventEmitter<void>;
  @Input() tutor_list: User[];

  tutorFormControl = new FormControl();
  filteredOptions: Observable<User[]>;

  // dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();
  dataSourceUsers: User[];
  showInputForTutor: boolean;
  tutorInputCourseID: number;

  constructor(private db: DatabaseService, private user: UserService, private snackBar: MatSnackBar) {
    this.loadAllCourses = new EventEmitter<void>();
  }

  ngOnInit() {
    this.db.getAllUsers().pipe(
      flatMap(users => {
        this.dataSourceUsers = users;
        this.filteredOptions = this.tutorFormControl.valueChanges
          .pipe(
            startWith<string | User>(''),
            map(value => typeof value === 'string' ? value : value.prename.concat(value.surname)),
            map(name => name ? this._filterTutorInput(name) : this.dataSourceUsers.slice())
          );
        return this.filteredOptions;
      })
    ).subscribe();
  }

  private _filterTutorInput(value: string): User[] {
    const filterValue = value.toLowerCase().replace(' ', '');

    return this.dataSourceUsers.filter(option => {
      return option.prename.toLowerCase().indexOf(filterValue) === 0
        || option.surname.toLowerCase().indexOf(filterValue) === 0
        || option.surname.toLowerCase().concat(option.prename.toLowerCase()).indexOf(filterValue) === 0
        || option.prename.toLowerCase().concat(option.surname.toLowerCase()).indexOf(filterValue) === 0;
    });
  }

  /**
   * Add tutor to course
   * @param courseID Course, the tutor will be added
   * @param key Keyboard press key 'ENTER'
   */
  addTutor(courseID: number, key: string) {
    if (key === 'Enter') {
      const selectedUser: User = this.tutorFormControl.value;
      this.tutorFormControl.setValue('');
      this.showInputForTutor = false;

      if (this.liveUpdate) {
        this.db.addTutorToCourse(courseID, selectedUser.user_id).subscribe(res => {
          this.loadAllCourses.emit();
        });
      } else {
        this.tutor_list.push(selectedUser);
      }
    }
  }

  /**
   * Remove tutor from course
   * @param courseID Course, tutor will be removed
   * @param userID The tutor id
   */
  removeTutor(courseID: number, userID: number) {
    if (this.liveUpdate) {
      this.db.removeTutorFromCourse(courseID, userID).subscribe(courses => {
        this.loadAllCourses.emit();
      });
    } else {
      const hiddenUser = this.tutor_list.filter((u: User) => {
        return u.user_id == userID;
      });
      console.log('here', hiddenUser );
      const i = this.tutor_list.indexOf(hiddenUser[0]);
      this.tutor_list.splice(i, 1);
    }
  }

  get correctCourseTutor() {
    if (this.liveUpdate) {
      return this.course.course_tutor;
    } else {
      return this.tutor_list;
    }
  }

  /**
   * Show only for course with right id the input
   * @param courseID The course input should be shown
   */
  showTutorInput(courseID: number) {
    this.tutorInputCourseID = courseID;
    this.showInputForTutor = true;
  }

  /**
   * Shows prename and surname of users in autocomplete
   * @param user The user to show
   */
  displayFn(user?: User): string | undefined {
    return user ? user.prename + ' ' + user.surname : undefined;
  }
}
