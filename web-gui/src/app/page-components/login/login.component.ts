import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {CookieService} from 'ngx-cookie-service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {AuthService} from '../../service/auth.service';
import {DataprivacyDialogComponent} from "../../components/dataprivacy-dialog/dataprivacy-dialog.component";


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
              @Inject(DOCUMENT) private document: Document, private cookie: CookieService,
              private snackbar: MatSnackBar) {
  }

  username: string;
  password: string;

  ngOnInit() {
    const cookie = this.cookie.get('jwt');
    if (cookie) {
      localStorage.setItem('token', cookie);
      const extraRoute = localStorage.getItem('route');
      if (extraRoute) {
        this.router.navigateByUrl('' + extraRoute);
        localStorage.removeItem('route');
      } else {
        this.router.navigate(['']);
      }
    }
  }

  private jwtParser(response){
    const authHeader: string = response.headers.get('Authorization');
    const token: string = authHeader.replace('Bearer ', '');
    localStorage.setItem('token', token);

    const extraRoute = localStorage.getItem('route');
    if (extraRoute) {
      localStorage.removeItem('route');
      this.router.navigateByUrl(extraRoute)
        .then((success) => {
          if(!success){
            this.router.navigateByUrl('/')
          }
        })
        .catch((error) => {
          console.log("Error beim Einloggen, Debugging: ", error)
        })
    } else {
      this.router.navigate(['']);
    }

  }

  /**
   * Login user with ldap. Show data privacy dialog
   * when user logs in for first time
   */
  login() {
    this.auth.login(this.username, this.password).toPromise().then(response => {
      if(response.body.success) {
        this.auth.loginPrivacyCheck(this.username).subscribe(success => {
          if(!success.success){
            this.dialog.open(DataprivacyDialogComponent).afterClosed().subscribe((key) => {
              if(key.success){
                this.auth.acceptPrivacyForUser(this.username).then((f) => {
                  this.jwtParser(response)
                }).catch((e) => {
                  this.snackbar.open('Leider gab es ein Problem beim Anmelden.', 'OK');
                })
              }
            })
          } else {
            this.jwtParser(response)
          }
        })
      }
      else {
        this.snackbar.open('Username oder Passwort falsch', 'OK', {duration: 3000});
      }
    }).catch((e) => {
      this.snackbar.open('Prüfen Sie Ihren Benutzernamen und Ihr Passwort.', 'OK', {duration: 3000});
    })
  }

  /**
   * Redirect to cas login
   */
  loginCAS() {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + '//' + getUrl.host;
    this.document.location.href = 'https://cas.thm.de/cas/login?service=' + baseUrl + '/api/v1/login';
  }
}
