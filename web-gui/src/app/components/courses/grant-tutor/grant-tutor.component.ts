import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {MatTableDataSource} from '@angular/material/table';
import {UserService} from '../../../service/user.service';
import {TitlebarService} from '../../../service/titlebar.service';
import {DatabaseService} from '../../../service/database.service';
import {GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';

/**
 * Adding or removing tutor from course
 */
@Component({
  selector: 'app-grant-tutor',
  templateUrl: './grant-tutor.component.html',
  styleUrls: ['./grant-tutor.component.scss']
})
export class GrantTutorComponent implements OnInit {

  constructor(private db: DatabaseService, private user: UserService, private snackBar: MatSnackBar,
              private titlebar: TitlebarService) {
  }


  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  columns = ['course_name'];
  dataSourceCourses = new MatTableDataSource<GeneralCourseInformation>();


  ngOnInit() {
    this.titlebar.emitTitle('Tutor wählen');
    this.loadAllCoursesTutor()
  }

  public loadAllCoursesTutor(){
    if (this.user.getUserRole() === 1) {
      this.db.getAllCourses().subscribe(courses => this.dataSourceCourses.data = courses);
    } else {
      this.db.getSubscribedCourses().subscribe(courses =>
        this.dataSourceCourses.data = courses.filter(course => course.role_id === 4));
    }
  }

  /**
   * Filters all courses
   * @param filterValue The value to filter with
   */
  filterCourses(filterValue: string) {
    this.dataSourceCourses.filter = filterValue;
  }









}
