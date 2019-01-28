import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {flatMap, map} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {DataprivacyDialogComponent} from '../dataprivacy-dialog/dataprivacy-dialog.component';
import {DOCUMENT} from '@angular/common';
import {CookieService} from 'ngx-cookie-service';

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog,
              @Inject(DOCUMENT) private document: Document, private cookie: CookieService) {
  }

  username: string;
  password: string;

  ngOnInit() {
    const cookie = this.cookie.get('jwt');
    if (cookie) {
      localStorage.setItem('token', cookie);
      this.router.navigate(['']);
    }

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
          return this.dialog.open(DataprivacyDialogComponent, {
            data: {
              username: this.username,
              password: this.password
            }
          }).afterClosed();
        }
      })
    ).pipe(map(response => {
      console.log(response);
      const authHeader: string = response.headers.get('Authorization');
      const token: string = authHeader.replace('Bearer ', '');
      localStorage.setItem('token', token);
      this.router.navigate(['']);
    })).subscribe();
  }

  loginCAS() {
    let getUrl = window.location;
    let baseUrl = getUrl .protocol + "//" + getUrl.host ;
    this.document.location.href = 'https://cas.thm.de/cas/login?service=' + baseUrl + '/api/v1/login';
  }

}
