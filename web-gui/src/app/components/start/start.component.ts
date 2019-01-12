import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {TitlebarService} from '../../service/titlebar.service';
import {Subscription} from 'rxjs';

/**
 * Root component shows sidenav and titlebar
 */
@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

  constructor(private user: UserService, private router: Router, private auth: AuthService,
              private titlebar: TitlebarService) {
  }

  private sub: Subscription;

  title: string;
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
        // this.router.navigate(['admin', 'dashboard']);
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

    this.sub = this.titlebar.getTitle().subscribe(title => this.title = title);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
