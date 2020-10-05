import { Component} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl, Validators} from "@angular/forms";
import {DatabaseService} from "../../service/database.service";
import {Succeeded} from "../../model/HttpInterfaces";
import {AuthService} from "../../service/auth.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  passwd_repeat: string;
  passwd: string;

  passwordMatcher = new FormControl('', [Validators.required]);

  constructor(private auth: AuthService, private db: DatabaseService,  private snackbar: MatSnackBar,) { }

  showOK(){
    this.snackbar.open("Super, das Passwort wurde geändert", 'OK', {duration: 3000})
      .afterDismissed()
      .subscribe()
  }

  showError(msg: string){
    this.snackbar.open(msg, 'OK', {duration: 3000});
  }
  save(){
    if(this.passwd.length == 0){
      this.showError("Bitte ein Passwort eingeben")
    }
    else if(this.passwd != this.passwd_repeat) {
      this.showError("Passwörter stimmen nicht überein")
    } else {
      this.db.setNewPWOfGuestAccount(this.auth.getToken().id, this.passwd, this.passwd_repeat)
        .subscribe((data:Succeeded) => {
          if(data.success){
            this.showOK()
            setTimeout(() => {
              location.reload()
            }, 2000)
          } else {
            this.showError("Leider gab es einen Fehler mit dem Update")
          }
        }, error => {
          this.showError("Leider gab es einen Fehler mit dem Update")
        })
    }
  }
}
