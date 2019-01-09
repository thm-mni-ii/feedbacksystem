import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {AuthService} from '../../../service/auth.service';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatSnackBar,
  MatSort,
  MatTableDataSource
} from '@angular/material';
import {CourseTableItem} from '../../student/student-list/course-table/course-table-datasource';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-grant-docent',
  templateUrl: './grant-docent.component.html',
  styleUrls: ['./grant-docent.component.scss']
})
export class GrantDocentComponent implements OnInit {

  constructor(private db: DatabaseService, private auth: AuthService, private snackBar: MatSnackBar) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  selectable = true;
  removable = true;
  fruits: string[] = ['Lemon', 'Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Apple', 'Lemon', 'Lime', 'Orange',
    'Strawberry', 'Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', 'Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry',
    'Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];


  dataSourceCourses = new MatTableDataSource<CourseTableItem>();
  columns = ['course_name'];


  // Select Docent
  docentUsername: string;
  newDocent: boolean;


  ngOnInit() {
    this.db.getAllCourses().subscribe(courses => {
      this.dataSourceCourses.data = courses;
      this.dataSourceCourses.sort = this.sort;
    });
  }

  showDocentInput() {
    this.newDocent = true;
  }


  selectDocent(courseID: number, courseName: string) {
    this.db.adminGrantDocentRights(courseID, this.docentUsername).subscribe(msg => {
    });
  }

  applyFilter(filterValue: string) {
    this.dataSourceCourses.filter = filterValue;
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }


}
