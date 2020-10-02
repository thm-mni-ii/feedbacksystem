import {Component, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../service/auth.service';

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string;
  password: string;

  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog,
              @Inject(DOCUMENT) private document: Document, private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    const extraRoute = localStorage.getItem('route');
    if (extraRoute) {
      localStorage.removeItem('route');
      this.router.navigateByUrl('' + extraRoute);
    } else {
      this.router.navigate(['']);
    }
  }

  /**
   * Login user locally into the system
   */
  localLogin() {
    this.auth.localLogin(this.username, this.password)
      .subscribe(() => {
        this.router.navigateByUrl('/')
        // TODO: check if it is the first login, and if so, display the privacy dialog
      }, error => {
        this.snackbar.open('Prüfen Sie Ihren Benutzernamen und Ihr Passwort.', 'OK', {duration: 3000});
      })
  }

  /**
   * Redirect to cas login
   */
  casLogin() {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + '//' + getUrl.host;
    this.document.location.href = 'https://cas.thm.de/cas/login?service=' + baseUrl + '/api/v1/login';
  }
}
