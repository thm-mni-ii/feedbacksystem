import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-student-start',
  templateUrl: './student-start.component.html',
  styleUrls: ['./student-start.component.scss'],
})
export class StudentStartComponent implements OnInit {

  constructor(private snackbar: MatSnackBar) {
  }

  ngOnInit() {
  }


  logout() {
    this.snackbar.open("Du hast dich ausgeloggt", "OK", {duration: 5000});
  }

}
