import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) {
  }

  username: string = '';
  password: string = '';

  ngOnInit() {
  }


  login() {
    switch (this.username.toLowerCase()) {
      case 'admin':
        if (this.password == 'admin') {
          this.router.navigate(['/admin']);
        }
        break;
      case 'prof':
        if (this.password == 'prof') {
          this.router.navigate(['/prof']);
        }
        break;
      case 'user':
        if (this.password == 'user') {
          this.router.navigate(['/user/courses']);
        }
        break;
      default:
        alert("Wrong username or password\n" +
          "admin:admin\n" +
          "prof:prof\n" +
          "user:user");
    }

  }


}
