import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';

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

  username = '';
  users: string[] = ['admin', 'moderator', 'docent', 'tutor', 'test-user'];


  ngOnInit() {
  }


  /**
   * Method that uses auth-service to login user
   */
  login() {
    // this.auth.login().subscribe(res => {
    //   window.open(res.url);
    // });

    this.auth.login_fake(this.username).subscribe(() => {
      this.router.navigate(['']);
    });
  }


}
