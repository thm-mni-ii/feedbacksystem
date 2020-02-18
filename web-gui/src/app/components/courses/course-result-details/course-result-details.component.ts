import {Component, OnInit} from '@angular/core';
import {DatabaseService} from "../../../service/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TitlebarService} from "../../../service/titlebar.service";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../service/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {flatMap, startWith, map} from "rxjs/operators";
import {
  CourseTask,
  DetailedCourseInformation,
  TaskSubmission,
  User
} from "../../../interfaces/HttpInterfaces";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
  selector: 'app-course-result-details',
  templateUrl: './course-result-details.component.html',
  styleUrls: ['./course-result-details.component.scss']
})
export class CourseResultDetailsComponent implements OnInit {

  courseID: number;
  courseDetails: any;
  students: User[] = [];
  taskList: CourseTask[] = [];
  userControl = new FormControl();
  taskControl = new FormControl();
  filteredOptions: Observable<User[]>;
  filteredTasks: Observable<CourseTask[]>;

  constructor(private db: DatabaseService, private route: ActivatedRoute, private titlebar: TitlebarService,
              private dialog: MatDialog, private user: UserService, private snackbar: MatSnackBar,
              private router: Router) {
  }

  denyAccess(){
    this.router.navigate(['404'])
  }

  allSubmissions: TaskSubmission[] = [];

  ngOnInit() {
    this.route.params.pipe(
      flatMap(params => {
        this.courseID = +params['id'];
        return this.db.getCourseDetail(this.courseID, true)
      })).subscribe(
      (result: DetailedCourseInformation) => {
        // Handle result
        this.courseDetails = result;

        if(Object.keys(this.courseDetails).length === 0){
          this.denyAccess()
        }
        this.taskList = this.courseDetails.tasks;
        this.db.getSubscribedUsersOfCourse(this.courseID).toPromise()
          .then(users => {
            this.students = users
          })
      },
      error => {
        this.denyAccess()
      },
    );

    this.filteredOptions = this.userControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.filteredTasks = this.taskControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterTask(value))
      );


  // TODO if not instructor, then deny access!


  }

  private _filterTask(value: string): CourseTask[] {
    const filterValue = value.toString().toLowerCase();

    return this.taskList.filter(option => {
      return option.task_description.toLowerCase().includes(filterValue) ||
        option.task_name.toLowerCase().includes(filterValue) ||
        option.task_id.toString().toLowerCase().includes(filterValue)
    });
  }



  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.students.filter(option => {
      return option.surname.toLowerCase().includes(filterValue) ||
        option.prename.toLowerCase().includes(filterValue) ||
        option.user_id.toString().toLowerCase().includes(filterValue) ||
        option.username.toLowerCase().includes(filterValue) ||
        option.email.toLowerCase().includes(filterValue)
    });
  }



  public showResultComparision() {
    let username = this.userControl.value;
    let taskId = this.taskControl.value;
    let userid = this.students.filter(s => s.username == username).map(s => s.user_id)[0]

    this.db.getSubmissionsOfUserOfTask(this.courseID, userid, taskId).toPromise()
      .then((res: TaskSubmission[]) => {

          this.allSubmissions = res
          if(this.allSubmissions.length == 0) throw new Error("Empty set")
      })
      .catch(e => {
        this.snackbar.open("Für diese Eingaben existieren keine Daten", 'OK', {duration: 3000});
      })
  }



}
