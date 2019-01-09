import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {AuthService} from '../../../service/auth.service';

/**
 * Component that shows the subscribed courses of a student.
 */
@Component({
  selector: 'app-student-start',
  templateUrl: './student-start.component.html',
  styleUrls: ['./student-start.component.scss'],
})
export class StudentStartComponent implements OnInit {

  user: String;

  constructor(private snackbar: MatSnackBar, private auth: AuthService) {
  }

  ngOnInit() {
    this.user = 'blaa';
  }


  logout() {
    this.auth.logout();
  }

}
