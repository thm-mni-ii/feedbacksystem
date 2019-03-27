import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {DatabaseService} from "../../../service/database.service";
import {UserService} from "../../../service/user.service";
import {MatSnackBar, MatSort, MatTableDataSource} from "@angular/material";
import {TitlebarService} from "../../../service/titlebar.service";
import {flatMap, map, startWith} from "rxjs/operators";
import {GeneralCourseInformation, User} from "../../../interfaces/HttpInterfaces";
import {Observable} from "rxjs";

@Component({
  selector: 'app-grand-tutor-snipp',
  templateUrl: './grand-tutor-snipp.component.html',
  styleUrls: ['./grand-tutor-snipp.component.scss']
})
export class GrandTutorSnippComponent implements OnInit {


  @ViewChild(MatSort) sort: MatSort;
  @Input() course;
  @Output() loadAllCourses: EventEmitter<void>;
  //@Input() dataSourceCourses;

  tutorFormControl = new FormControl();
  filteredOptions: Observable<User[]>;

  //dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();
  dataSourceUsers : User[];
  showInputForTutor: boolean;
  tutorInputCourseID: number;


  constructor(private db: DatabaseService, private user: UserService, private snackBar: MatSnackBar) {
    this.loadAllCourses = new EventEmitter<void>()
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

      this.db.addTutorToCourse(courseID, selectedUser.user_id).subscribe(res => {
        this.loadAllCourses.emit();
      })
    }
  }

  /**
   * Remove tutor from course
   * @param courseID Course, tutor will be removed
   * @param userID The tutor id
   */
  removeTutor(courseID: number, userID: number) {
    this.db.removeTutorFromCourse(courseID, userID).subscribe(courses => {
      this.loadAllCourses.emit();
    });
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
