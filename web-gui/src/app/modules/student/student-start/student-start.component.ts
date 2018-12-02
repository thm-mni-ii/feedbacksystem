import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material";
import {Student} from "../Student";
import {AuthService} from "../../../service/auth.service";

/**
 * Component that shows the courses from a student.
 * This is the first component that the student sees after login.
 */
@Component({
  selector: 'app-student-start',
  templateUrl: './student-start.component.html',
  styleUrls: ['./student-start.component.scss'],
})
export class StudentStartComponent implements OnInit {

  randomStudent: Student[];
  student: Student;

  constructor(private snackbar: MatSnackBar, private auth: AuthService) {
  }

  ngOnInit() {

    // Generating Random Students to simulate different login
    this.randomStudent = [
      {fName: "Lukas", sName: "Boehm", mNumber: 37465486},
      {fName: "Manuela", sName: "Kohl", mNumber: 4390584},
      {fName: "Jürgen", sName: "Fisher", mNumber: 5342545},
      {fName: "Christin", sName: "Kuhn", mNumber: 7564757},
      {fName: "Michelle", sName: "Eberhardt", mNumber: 1209384},
      {fName: "Mathias", sName: "Strauss", mNumber: 198172},
      {fName: "Bernd", sName: "Schreiber", mNumber: 8927314},
    ];
    this.student = this.randomStudent[Math.floor(Math.random() * this.randomStudent.length)];
  }


  logout() {
    this.auth.logout();
    this.snackbar.open("Du hast dich ausgeloggt", "OK", {duration: 5000});
  }

}
