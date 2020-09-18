import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TitlebarService} from '../../../service/titlebar.service';
import {NewCourse, Testsystem, User} from '../../../interfaces/HttpInterfaces';
import {Router} from '@angular/router';

/**
 * Create a new course
 */
@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})

export class NewCourseComponent implements OnInit, OnDestroy {
  // newCourseForm: FormGroup;

  constructor(private db: DatabaseService,
              private _formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private titlebar: TitlebarService,
              private router: Router) {
  }

  SEMESTER_PATTERN = '^((WS)[0-9]{2,2}\\/[0-9]{2,2})|^(SS[0-9]{2,2})';

  subscription: Subscription = new Subscription();

  testTypes$: Observable<Testsystem[]>;
  newCourseName = new FormControl('', [Validators.required]);
  newCourseDescription = new FormControl('');
  newCourseType = new FormControl('', [Validators.required]);
  newCourseSemester = new FormControl('', [Validators.pattern(this.SEMESTER_PATTERN)]);
  newCourseModuleID = new FormControl('');
  newCourseDate = new FormControl('');
  newCoursePrivateUserData = new FormControl('', [Validators.required]);

  docent_list: User[];
  tutor_list: User[];

  ngOnInit() {
    this.docent_list = [];
    this.tutor_list = [];

    this.testTypes$ = this.db.getTestsystemTypes();
    this.titlebar.emitTitle('Neuen Kurs erstellen');
    this.newCoursePrivateUserData.setValue(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Get data from form groups and create new course
   */
  createCourse() {
    if (!this.isInputValid) {
      return;
    }

    let privateUserData: boolean;
    privateUserData = this.newCoursePrivateUserData.value === 'true';

    this.db.createCourse(this.newCourseName.value,
      this.newCourseDescription.value,
      this.newCourseType.value,
      this.newCourseSemester.value,
      this.newCourseModuleID.value,
      this.newCourseDate.value,
      privateUserData).subscribe((data: NewCourse) => {
      let updateDocentTutorList = [];
      this.tutor_list.forEach(u => {
        updateDocentTutorList.push(this.db.addTutorToCourse(data.course_id, u.user_id).toPromise());
      });

      this.docent_list.forEach(u => {
        updateDocentTutorList.push(this.db.addDocentToCourse(data.course_id, u.user_id).toPromise());
      });

      Promise.all(updateDocentTutorList).then(() => {
        setTimeout( () => {this.router.navigate(['courses', data.course_id]); }, 100);
      });
    });
  }

  isInputValid(): boolean {
    return this.newCourseName.valid && this.newCourseType.valid;
  }
}
