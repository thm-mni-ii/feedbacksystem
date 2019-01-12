import {Component, OnInit, ViewChild} from '@angular/core';
import {CourseTableItem, DatabaseService, User} from '../../../service/database.service';
import {MatAutocomplete, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {flatMap, map, startWith} from 'rxjs/operators';
import {TitlebarService} from '../../../service/titlebar.service';

/**
 * Adding and removing docents from courses
 */
@Component({
  selector: 'app-grant-docent',
  templateUrl: './grant-docent.component.html',
  styleUrls: ['./grant-docent.component.scss']
})
export class GrantDocentComponent implements OnInit {

  constructor(private db: DatabaseService, private titlebar: TitlebarService, private snackBar: MatSnackBar) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  dataSourceCourses = new MatTableDataSource<CourseTableItem>();
  dataSourceUsers: User[];
  docentFormControl = new FormControl();
  filteredOptions: Observable<User[]>;
  columns = ['course_name'];
  showInputForDocent: boolean;
  docentInputCourseID: number;


  ngOnInit() {
    this.titlebar.emitTitle('Dozent wählen');

    this.db.getAllCourses().subscribe(courses => this.dataSourceCourses.data = courses);
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

    this.dataSourceCourses.sort = this.sort;


  }

  private _filterDocentInput(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.dataSourceUsers.filter(option => {
      return option.prename.concat(' ').toLowerCase().indexOf(filterValue) === 0
        || option.surname.concat(' ').toLowerCase().indexOf(filterValue) === 0;
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
   * course docent input
   * @param courseID
   */
  showDocentInput(courseID: number) {
    this.docentInputCourseID = courseID;
    this.showInputForDocent = true;
  }

  /**
   * Filters all courses
   * @param filterValue The value to filter with
   */
  filterCourses(filterValue: string) {
    this.dataSourceCourses.filter = filterValue;
  }

  /**
   * Add docent to course
   * @param courseID Course the docent will be added
   * @param key Keyboard press key
   */
  addDocent(courseID: number, key: string) {
    if (key === 'Enter') {
      const selectedUser: User = this.docentFormControl.value;
      this.docentFormControl.setValue('');
      this.showInputForDocent = false;

      this.db.addDocentToCourse(courseID, selectedUser.user_id).pipe(
        flatMap(res => {
          console.log(res);
          return this.db.getAllCourses();
        })
      ).subscribe(courses => this.dataSourceCourses.data = courses);
    }
  }

  /**
   * Remove docent from course
   * @param courseID Course docent will be removed
   * @param userID Docent id
   */
  removeDocent(courseID: number, userID: number) {
    this.db.removeDocentFromCourse(courseID, userID).pipe(
      flatMap(res => {
        if (res.success) {
          return this.db.getAllCourses();
        }
      })
    ).subscribe(courses => {
      this.dataSourceCourses.data = courses;
    });

  }


}
