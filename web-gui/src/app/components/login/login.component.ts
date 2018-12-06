import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../service/auth.service";

/**
 * Manages the login page for Submissionchecker
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private auth: AuthService) {
  }

  username: string = '';
  users: string[] = ['test-user', 'prof', 'admin'];


  ngOnInit() {
  }


  /**
   * Method that uses auth-service to login user
   */
  login() {
    //TODO: Replace with real login
    this.auth.login_fake(this.username);
  }


}
