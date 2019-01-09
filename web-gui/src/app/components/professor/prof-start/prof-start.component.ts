import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {AuthService} from '../../../service/auth.service';

@Component({
  selector: 'app-prof-start',
  templateUrl: './prof-start.component.html',
  styleUrls: ['./prof-start.component.scss']
})
export class ProfStartComponent implements OnInit {


  profUsername: string;

  constructor(private snackbar: MatSnackBar, private auth: AuthService) {
  }

  ngOnInit() {
    this.profUsername = 'bla';
  }


  logout() {
    this.auth.logout();
  }

}
