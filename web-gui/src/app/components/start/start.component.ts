import {Component, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';

/**
 * Root component shows sidenav and titlebar
 */
@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(private user: UserService, private router: Router, private auth: AuthService) {
  }

  userRole: string;
  isAdmin: boolean;
  isDocent: boolean;
  isModerator: boolean;
  isTutor: boolean;
  isStudent: boolean;

  opened: boolean;
  username: string;

  ngOnInit() {
    this.username = this.user.getUsername();
    this.userRole = this.user.getUserRole();

    switch (this.userRole) {
      case 'admin':
        this.isAdmin = true;
        this.router.navigate(['admin', 'dashboard']);
        break;
      case 'moderator':
        this.isModerator = true;
        break;
      case 'docent':
        this.router.navigate(['docent', 'dashboard']);
        this.isDocent = true;
        break;
      case 'tutor':
        this.router.navigate(['student', 'dashboard']);
        this.isTutor = true;
        break;
      case 'student':
        this.router.navigate(['student', 'dashboard']);
        this.isStudent = true;
        break;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }

}
