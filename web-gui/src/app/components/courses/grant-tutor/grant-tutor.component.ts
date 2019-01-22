import {Component, OnInit, ViewChild} from '@angular/core';
import {MatAutocomplete, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {flatMap, map, startWith} from 'rxjs/operators';
import {UserService} from '../../../service/user.service';
import {TitlebarService} from '../../../service/titlebar.service';
import {DatabaseService} from '../../../service/database.service';
import {GeneralCourseInformation, User} from '../../../interfaces/HttpInterfaces';

@Component({
  selector: 'app-grant-tutor',
  templateUrl: './grant-tutor.component.html',
  styleUrls: ['./grant-tutor.component.scss']
})
export class GrantTutorComponent implements OnInit {

  constructor(private db: DatabaseService, private user: UserService, private snackBar: MatSnackBar,
              private titlebar: TitlebarService) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();
  dataSourceUsers: User[];
  tutorFormControl = new FormControl();
  filteredOptions: Observable<User[]>;
  columns = ['course_name'];
  showInputForTutor: boolean;
  tutorInputCourseID: number;


  ngOnInit() {
    this.titlebar.emitTitle('Tutor wählen');

    if (this.user.getUserRole() === 1) {
      this.db.getAllCourses().subscribe(courses => this.dataSourceCourses.data = courses);
    } else {
      this.db.getSubscribedCourses().subscribe(courses => this.dataSourceCourses.data = courses);
    }
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

    this.dataSourceCourses.sort = this.sort;


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
   * Shows prename and surname of users in autocomplete
   * @param user The user to show
   */
  displayFn(user?: User): string | undefined {
    return user ? user.prename + ' ' + user.surname : undefined;
  }

  /**
   * Save course id and shows for that specific
   * course tutor input
   * @param courseID
   */
  showTutorInput(courseID: number) {
    this.tutorInputCourseID = courseID;
    this.showInputForTutor = true;
  }

  /**
   * Filters all courses
   * @param filterValue The value to filter with
   */
  filterCourses(filterValue: string) {
    this.dataSourceCourses.filter = filterValue;
  }

  /**
   * Add tutor to course
   * @param courseID Course, the tutor will be added
   * @param key Keyboard press key
   */
  addTutor(courseID: number, key: string) {
    if (key === 'Enter') {
      const selectedUser: User = this.tutorFormControl.value;
      this.tutorFormControl.setValue('');
      this.showInputForTutor = false;

      this.db.addTutorToCourse(courseID, selectedUser.user_id).pipe(
        flatMap(res => {
          if (this.user.getUserRole() === 1) {
            return this.db.getAllCourses();
          } else {
            return this.db.getSubscribedCourses();
          }
        })
      ).subscribe(courses => this.dataSourceCourses.data = courses);
    }
  }

  /**
   * Remove tutor from course
   * @param courseID Course, tutor will be removed
   * @param userID The tutor id
   */
  removeTutor(courseID: number, userID: number) {
    this.db.removeTutorFromCourse(courseID, userID).pipe(
      flatMap(res => {
        if (res.success) {
          if (this.user.getUserRole() === 1) {
            return this.db.getAllCourses();
          } else {
            return this.db.getSubscribedCourses();
          }
        }
      })
    ).subscribe(courses => {
      this.dataSourceCourses.data = courses;
    });

  }
}
