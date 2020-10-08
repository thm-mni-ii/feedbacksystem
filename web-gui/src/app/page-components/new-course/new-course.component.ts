import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Observable, of, Subscription} from 'rxjs';
import {flatMap} from 'rxjs/operators';
import {NewCourse, Testsystem, User} from '../../model/HttpInterfaces';
import {DatabaseService} from '../../service/database.service';
import {TitlebarService} from '../../service/titlebar.service';
import {Course} from "../../model/Course";
import {CourseService} from "../../service/course.service";

/**
 * Create a new course
 */
@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})

export class NewCourseComponent implements OnInit, OnDestroy {
  constructor(private courseService: CourseService,
              private _formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private titlebar: TitlebarService,
              private router: Router) {
  }

  subscription: Subscription = new Subscription();
  name = new FormControl('', [Validators.required]);
  description = new FormControl('');
  isVisible = true

  docent_list: User[];
  tutor_list: User[];

  ngOnInit() {
    this.docent_list = [];
    this.tutor_list = [];
    this.titlebar.emitTitle('Neuen Kurs erstellen');
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

    const course: Course = {
      name: this.name.value,
      description: this.description.value,
      visible: this.isVisible
    }

    return this.courseService
      .createCourse(course)
      .pipe(flatMap(course => {
        const priviledgeObservables: Observable<any>[] = []
        // TODO: fix me
        return of()
      }))
      .subscribe(done => {
        // TODO
      }, error => {
        // TODO
      })



    // this.db.createCourse(this.newCourseName.value,
    //   this.newCourseDescription.value,
    //   this.newCourseType.value,
    //   this.newCourseSemester.value,
    //   this.newCourseModuleID.value,
    //   this.newCourseDate.value,
    //   privateUserData).subscribe((data: NewCourse) => {
    //   let updateDocentTutorList = [];
    //   this.tutor_list.forEach(u => {
    //     updateDocentTutorList.push(this.db.addTutorToCourse(data.course_id, u.user_id).toPromise());
    //   });
    //
    //   this.docent_list.forEach(u => {
    //     updateDocentTutorList.push(this.db.addDocentToCourse(data.course_id, u.user_id).toPromise());
    //   });
    //
    //   Promise.all(updateDocentTutorList).then(() => {
    //     setTimeout( () => {this.router.navigate(['courses', data.course_id]); }, 100);
    //   });
    // });
  }

  isInputValid(): boolean {
    return this.name.valid && this.description.valid;
  }
}
