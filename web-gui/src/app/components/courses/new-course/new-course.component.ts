import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {MatSnackBar, MatStepper} from '@angular/material';
import {TitlebarService} from '../../../service/titlebar.service';
import {Testsystem} from '../../../interfaces/HttpInterfaces';

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

  subscription: Subscription = new Subscription();

  firstFG: FormGroup;
  secondFG: FormGroup;
  thirdFG: FormGroup;
  fourthFG: FormGroup;
  fifthFG: FormGroup;
  sixthFG: FormGroup;

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
    this.firstFG = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFG = this._formBuilder.group({
      secondCtrl: ['']
    });
    this.thirdFG = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.fourthFG = this._formBuilder.group({
      fourthCtrl: ['']
    });
    this.fifthFG = this._formBuilder.group({
      fifthCtrl: ['']
    });
    this.sixthFG = this._formBuilder.group({
      sixthCtrl: ['']
    });


    this.subscription.add(this.firstFG.valueChanges.subscribe(
      (inputStep1: { firstCtrl: string }) => {
        this.newCourseName = inputStep1.firstCtrl;
      }));

    this.subscription.add(this.secondFG.valueChanges.subscribe(
      (inputStep2: { secondCtrl: string }) => {
        this.newCourseDescription = inputStep2.secondCtrl;
      }));

    this.subscription.add(this.thirdFG.valueChanges.subscribe(
      (inputStep3: { thirdCtrl: string }) => {
        this.newCourseType = inputStep3.thirdCtrl;
      }));

    this.subscription.add(this.fourthFG.valueChanges.subscribe(
      (inputStep4: { fourthCtrl: string }) => {
        this.newCourseSemester = inputStep4.fourthCtrl;
      }));

    this.subscription.add(this.fifthFG.valueChanges.subscribe(
      (inputStep5: { fifthCtrl: string }) => {
        this.newCourseModuleID = inputStep5.fifthCtrl;
      }));
    this.subscription.add(this.sixthFG.valueChanges.subscribe(
      (inputStep6: { sixthCtrl: string }) => {
        this.newCourseDate = inputStep6.sixthCtrl;
      }
    ));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createCourse() {
    if (!this.newCourseDescription) {
      this.newCourseDescription = '';
    }

    if (!this.newCourseModuleID) {
      this.newCourseModuleID = '';
    }

    if (!this.newCourseSemester) {
      this.newCourseSemester = '';
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
