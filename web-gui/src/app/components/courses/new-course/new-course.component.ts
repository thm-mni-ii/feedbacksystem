import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatStepper} from '@angular/material/stepper';
import {TitlebarService} from '../../../service/titlebar.service';
import {NewCourse, Testsystem, User} from '../../../interfaces/HttpInterfaces';
import {Router} from "@angular/router";

/**
 * Create a new course
 */
@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss'],
})
export class NewCourseComponent implements OnInit, OnDestroy {

  constructor(private db: DatabaseService, private _formBuilder: FormBuilder,
              private snackBar: MatSnackBar, private titlebar: TitlebarService, private router: Router) {
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

  docent_list: User[];
  tutor_list: User[];

  ngOnInit() {
    this.docent_list = []
    this.tutor_list = []

    this.testTypes$ = this.db.getTestsystemTypes();
    this.titlebar.emitTitle('Neuen Kurs erstellen');
    this.newCoursePrivatUserData = 'Nein';


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
        if(inputStep1.firstCtrl){
          if (inputStep1.firstCtrl.match('^ $')) {
            inputStep1.firstCtrl = '';
          }
          this.newCourseName = inputStep1.firstCtrl;
        }
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
    privateUserData = this.newCoursePrivatUserData === 'Ja';
    let date = new Date(this.newCourseDate)
    let formatedDate:string = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
    this.db.createCourse(this.newCourseName, this.newCourseDescription, this.newCourseType, this.newCourseSemester,
      this.newCourseModuleID, formatedDate, privateUserData).subscribe((data: NewCourse) => {
      this.snackBar.open('Kurs ' + this.newCourseName + ' wurde erstellt', 'OK',
        {duration: 5000});
      this.stepper.reset();

      let updateDocentTutorList = []
      this.tutor_list.forEach(u => {
        updateDocentTutorList.push(this.db.addTutorToCourse(data.course_id, u.user_id).toPromise())
      })

      this.docent_list.forEach(u => {
        updateDocentTutorList.push(this.db.addDocentToCourse(data.course_id, u.user_id).toPromise())
      })

      console.log(this.docent_list,this.tutor_list, updateDocentTutorList)
      Promise.all(updateDocentTutorList).then(() => {
        setTimeout( () => {this.router.navigate(['courses', data.course_id])},100)
      })
    });
  }
}
