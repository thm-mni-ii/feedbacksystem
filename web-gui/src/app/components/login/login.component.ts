import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {flatMap, map} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DataprivacyDialogComponent} from '../dataprivacy-dialog/dataprivacy-dialog.component';

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog) {
  }

  username: string;
  password: string;

  ngOnInit() {

  }


  /**
   * Method that uses auth-service to login user
   */
  login() {
    this.auth.loginPrivacyCheck(this.username).pipe(
      flatMap(success => {
        if (success.success) {
          return this.auth.login(this.username, this.password);
        } else {
          //  Show dataprivacy
          return this.dialog.open(DataprivacyDialogComponent).afterClosed();
        }
      })
    ).pipe(map(response => {
      const authHeader: string = response.headers.get('Authorization');
      const token: string = authHeader.replace('Bearer ', '');
      localStorage.setItem('token', token);
      this.router.navigate(['']);
    })).subscribe();
  }


}
