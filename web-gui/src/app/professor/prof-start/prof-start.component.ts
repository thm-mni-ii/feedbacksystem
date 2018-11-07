import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-prof-start',
  templateUrl: './prof-start.component.html',
  styleUrls: ['./prof-start.component.scss']
})
export class ProfStartComponent implements OnInit {

  constructor(private snackbar: MatSnackBar) {
  }

  ngOnInit() {
  }


  logout() {
    this.snackbar.open("Du hast dich ausgeloggt", "OK", {duration: 5000});
  }

}
