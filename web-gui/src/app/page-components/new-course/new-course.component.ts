import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, Validators} from '@angular/forms';
import {TitlebarService} from '../../service/titlebar.service';
import {Course} from '../../model/Course';
import {CourseService} from '../../service/course.service';

/**
 * Create a new course
 */
@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})

export class NewCourseComponent implements OnInit {
  name = new FormControl('', [Validators.required]);
  description = new FormControl('');
  isVisible = true;

  constructor(private courseService: CourseService,
              private snackBar: MatSnackBar,
              private titlebar: TitlebarService,
              private router: Router) {
  }

  ngOnInit() {
    this.titlebar.emitTitle('Neuen Kurs erstellen');
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
    };

    this.courseService
      .createCourse(course)
      .subscribe(createdCourse => {
        setTimeout( () => {this.router.navigate(['courses', createdCourse.id]); }, 100);
      }, error => {
        console.error(error);
        this.snackBar.open('Es ist ein fehler beim erstellen des Kurses aufgetreten', null, {duration: 3000});
      });
  }

  isInputValid(): boolean {
    return this.name.valid && this.description.valid;
  }
}
