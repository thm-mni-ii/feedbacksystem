import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TitlebarService} from '../../service/titlebar.service';
import {FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {UserService} from '../../service/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  passwd_repeat: string;
  passwd: string;

  passwordMatcher = new FormControl('', [Validators.required]);

  constructor(private auth: AuthService, private userService: UserService,
              private snackbar: MatSnackBar,
              private titlebar: TitlebarService) {}

  ngOnInit() {
    this.titlebar.emitTitle('Passwort ändern');
  }

  showOK() {
    this.snackbar.open('Super, das Passwort wurde geändert', 'OK', {duration: 3000})
      .afterDismissed()
      .subscribe();
  }

  showError(msg: string) {
    this.snackbar.open(msg, 'OK', {duration: 3000});
  }

  save() {
    if (this.passwd.length === 0) {
      this.showError('Bitte ein Passwort eingeben');
    } else if (this.passwd !== this.passwd_repeat) {
      this.showError('Passwörter stimmen nicht überein');
    } else {
      this.userService.changePassword(this.auth.getToken().id, this.passwd, this.passwd_repeat).subscribe(
      res => {
          this.showOK();
          setTimeout(() => {
            location.reload();
          }, 2000);
        }, error => {
          this.showError('Leider gab es einen Fehler mit dem Update');
        });
      }
    }
}
