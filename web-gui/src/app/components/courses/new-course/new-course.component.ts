import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {MatSnackBar, MatStepper} from '@angular/material';
import {TitlebarService} from '../../../service/titlebar.service';
import {Testsystem} from '../../../interfaces/HttpInterfaces';

/**
 * Create a new course
 */
@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})
export class NewCourseComponent implements OnInit, OnDestroy {

  constructor(private db: DatabaseService, private _formBuilder: FormBuilder,
              private snackBar: MatSnackBar, private titlebar: TitlebarService) {
  }

  @ViewChild('stepper') stepper: MatStepper;

  SEMESTER_PATTERN = '^((WS)[0-9]{2,2}\\/[0-9]{2,2})|^(SS[0-9]{2,2})';
  YEAR_PATTERN = '^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))' +
    '(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])' +
    '|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])' +
    '|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$';

  subscription: Subscription = new Subscription();

  courseNameFG: FormGroup;
  courseDescriptionFG: FormGroup;
  courseTaskTypeFG: FormGroup;
  courseSemesterFG: FormGroup;
  courseModuleIDFG: FormGroup;
  courseEndFG: FormGroup;

  testTypes$: Observable<Testsystem[]>;
  newCourseName: string;
  newCourseDescription: string;
  newCourseType: string;
  newCourseSemester: string;
  newCourseModuleID: string;
  newCourseDate: string;
  newCoursePrivatUserData: string;


  ngOnInit() {

    this.testTypes$ = this.db.getTestsystemTypes();
    this.titlebar.emitTitle('Neuen Kurs erstellen');
    this.newCoursePrivatUserData = 'false';


    // Check if step is done
    this.courseNameFG = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.courseDescriptionFG = this._formBuilder.group({
      secondCtrl: ['']
    });
    this.courseTaskTypeFG = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.courseSemesterFG = this._formBuilder.group({
      fourthCtrl: ['', Validators.pattern(this.SEMESTER_PATTERN)]
    });
    this.courseModuleIDFG = this._formBuilder.group({
      fifthCtrl: ['']
    });
    this.courseEndFG = this._formBuilder.group({
      sixthCtrl: ['', Validators.pattern(this.YEAR_PATTERN)]
    });


    this.subscription.add(this.courseNameFG.valueChanges.subscribe(
      (inputStep1: { firstCtrl: string }) => {
        if (inputStep1.firstCtrl.match(' ')) {
          inputStep1.firstCtrl = '';
        }
        this.newCourseName = inputStep1.firstCtrl;
      }));

    this.subscription.add(this.courseDescriptionFG.valueChanges.subscribe(
      (inputStep2: { secondCtrl: string }) => {
        this.newCourseDescription = inputStep2.secondCtrl;
      }));

    this.subscription.add(this.courseTaskTypeFG.valueChanges.subscribe(
      (inputStep3: { thirdCtrl: string }) => {
        this.newCourseType = inputStep3.thirdCtrl;
      }));

    this.subscription.add(this.courseSemesterFG.valueChanges.subscribe(
      (inputStep4: { fourthCtrl: string }) => {
        this.newCourseSemester = inputStep4.fourthCtrl;
      }));

    this.subscription.add(this.courseModuleIDFG.valueChanges.subscribe(
      (inputStep5: { fifthCtrl: string }) => {
        this.newCourseModuleID = inputStep5.fifthCtrl;
      }));
    this.subscription.add(this.courseEndFG.valueChanges.subscribe(
      (inputStep6: { sixthCtrl: string }) => {
        this.newCourseDate = inputStep6.sixthCtrl;
      }
    ));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Get data from form groups and create new course
   */
  createCourse() {
    if (!this.newCourseDescription) {
      this.newCourseDescription = '';
    }

    if (!this.newCourseModuleID) {
      this.newCourseModuleID = '';
    }

    if (!this.newCourseSemester || !this.newCourseSemester.match(this.SEMESTER_PATTERN)) {
      this.newCourseSemester = '';
    }

    if (!this.newCourseDate || !this.newCourseDate.match(this.YEAR_PATTERN)) {
      this.newCourseDate = '';
    }

    let privateUserData: boolean;
    privateUserData = this.newCoursePrivatUserData === 'true';

    this.db.createCourse(this.newCourseName, this.newCourseDescription, this.newCourseType, this.newCourseSemester,
      this.newCourseModuleID, this.newCourseDate, privateUserData).subscribe(() => {
      this.snackBar.open('Kurs ' + this.newCourseName + ' wurde erstellt', 'OK',
        {duration: 5000});
      this.stepper.reset();
    });
  }


}
