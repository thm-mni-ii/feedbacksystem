import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../service/auth.service';
import {LegalService} from '../../service/legal.service';
import {DataprivacyDialogComponent} from '../../dialogs/dataprivacy-dialog/dataprivacy-dialog.component';
import {CookieService} from 'ngx-cookie-service';
import {GoToService} from '../../service/goto.service';

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;

  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog,
              @Inject(DOCUMENT) private document: Document, private snackbar: MatSnackBar,
              private legalService: LegalService, private cookieService: CookieService,
              private goToService: GoToService) {
  }

  ngOnInit() {
    const token = this.cookieService.get('jwt');
    if (token) {
      localStorage.setItem('token', token);
    }

    if (this.auth.isAuthenticated()) {
      const goneTo = this.goToService.goTo();
      if (!goneTo) {
        const extraRoute = localStorage.getItem('route');
        if (extraRoute) {
          localStorage.removeItem('route');
          this.router.navigateByUrl('' + extraRoute);
        } else {
          this.router.navigate(['/courses']);
        }
      }
    }

    this.goToService.clearGoTo();
  }

  /**
   * Login user locally into the system
   */
  localLogin() {
    this.auth.localLogin(this.username, this.password)
      .subscribe(token => {
        this.checktermsOfUse(token.id);
      }, () => {
        this.snackbar.open('Prüfen Sie Ihren Benutzernamen und Ihr Passwort.', 'OK', {duration: 3000});
      });
  }

  /**
   * Redirect to cas login
   */
  casLogin() {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + '//' + getUrl.host;
    this.document.location.href = 'https://cas.thm.de/cas/login?service=' + baseUrl + '/api/v1/login/cas';
  }

  private checktermsOfUse(uid: number) {
    this.legalService.getTermsOfUse(uid).subscribe(res => {
        if (res.accepted) {
          this.router.navigateByUrl('/courses');
        } else {
          this.dialog.open(DataprivacyDialogComponent, {data: {onlyForShow: false}}).afterClosed()
            .subscribe( data => {
              if (data.success) {
                this.legalService.acceptTermsOfUse(uid).subscribe(_ => {
                  this.router.navigateByUrl('/courses');
                });
              } else {
                this.auth.logout();
              }
            }, error => {
              this.auth.logout();
            });
        }
      });
  }
}
