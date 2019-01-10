import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {TypesService} from '../../../service/types.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MatSnackBar, MatStepper} from '@angular/material';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})
export class NewCourseComponent implements OnInit, OnDestroy {

  constructor(private db: DatabaseService, private types: TypesService, private _formBuilder: FormBuilder,
              private snackBar: MatSnackBar) {
  }

  @ViewChild('stepper') stepper: MatStepper;

  subscription: Subscription = new Subscription();

  firstFG: FormGroup;
  secondFG: FormGroup;
  thirdFG: FormGroup;
  fourthFG: FormGroup;
  fifthFG: FormGroup;
  sixthFG: FormGroup;

  newCourseName: string;
  newCourseDescription: string;
  newCourseType: string;
  newCourseSemester: string;
  newCourseModuleID: string;
  newCoursePrivatUserData: boolean;

  taskTypes: string[];

  ngOnInit() {
    // TODO Replace with route for types
    this.taskTypes = this.types.getTypes();

    // Check if step is done
    this.firstFG = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFG = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFG = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.fourthFG = this._formBuilder.group({
      fourthCtrl: ['', Validators.required]
    });
    this.fifthFG = this._formBuilder.group({
      fifthCtrl: ['', Validators.required]
    });
    this.sixthFG = this._formBuilder.group({
      sixthCtrl: ['', Validators.required]
    });

    this.subscription.add(this.firstFG.valueChanges.subscribe(
      (inputStep1: { firstCtrl: string }) => {
        this.newCourseName = inputStep1.firstCtrl;
        return this.secondFG.valueChanges;
      }));

    this.subscription.add(this.secondFG.valueChanges.subscribe(
      (inputStep2: { secondCtrl: string }) => {
        this.newCourseDescription = inputStep2.secondCtrl;
        return this.thirdFG.valueChanges;
      }));

    this.subscription.add(this.thirdFG.valueChanges.subscribe(
      (inputStep3: { thirdCtrl: string }) => {
        this.newCourseType = inputStep3.thirdCtrl;
        return this.fourthFG.valueChanges;
      }));

    this.subscription.add(this.fourthFG.valueChanges.subscribe(
      (inputStep4: { fourthCtrl: string }) => {
        this.newCourseSemester = inputStep4.fourthCtrl;
        return this.fifthFG.valueChanges;
      }));

    this.subscription.add(this.fifthFG.valueChanges.subscribe(
      (inputStep5: { fifthCtrl: string }) => {
        this.newCourseModuleID = inputStep5.fifthCtrl;
        return this.sixthFG.valueChanges;
      }));

    this.subscription.add(this.sixthFG.valueChanges.subscribe(
      (inputStep6: { sixthCtrl: boolean }) => {
        this.newCoursePrivatUserData = inputStep6.sixthCtrl;
      }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createCourse() {
    this.db.createCourse(this.newCourseName, this.newCourseDescription, this.newCourseType, this.newCourseSemester,
      this.newCourseModuleID, this.newCoursePrivatUserData).subscribe(() => {
      this.snackBar.open('Kurs ' + this.newCourseName + ' wurde erstellt', 'OK',
        {duration: 5000});
      this.stepper.reset();
    });
  }


}
