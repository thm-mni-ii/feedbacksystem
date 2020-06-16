import { Component, OnInit } from '@angular/core';
import {UserService} from "../../../service/user.service";
import {DatabaseService} from "../../../service/database.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Succeeded} from "../../../interfaces/HttpInterfaces";
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

@Component({
  selector: 'app-change-passwd',
  templateUrl: './change-passwd.component.html',
  styleUrls: ['./change-passwd.component.scss']
})
export class ChangePasswdComponent implements OnInit {
  passwd_repeat: string;
  passwd: string;


  passwordMatcher = new FormControl('', [Validators.required]);

  constructor(private userService: UserService, private db: DatabaseService,  private snackbar: MatSnackBar,) { }

  showOK(){
    this.snackbar.open("Super, das Passwort wurde geändert", 'OK', {duration: 3000})
      .afterDismissed()
      .toPromise()
      .then()
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
      this.db.setNewPWOfGuestAccount(this.userService.getUserId(), this.passwd, this.passwd_repeat).toPromise()
        .then((data:Succeeded) => {
          if(data.success){
            this.showOK()
            setTimeout(() => {
              location.reload()
            }, 2000)
          } else {
            this.showError("Leider gab es einen Fehler mit dem Update")
          }
        }).catch((e) => {
        this.showError("Leider gab es einen Fehler mit dem Update")
      })
    }
  }

  ngOnInit() {
  }
}
