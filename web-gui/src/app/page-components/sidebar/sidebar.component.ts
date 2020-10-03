import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {TitlebarService} from '../../service/titlebar.service';
import {Subscription, Observable, of} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {Roles} from "../../model/Roles";

/**
 * Root component shows sidenav and titlebar
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private router: Router,
              private auth: AuthService,
              private titlebar: TitlebarService) {
  }

  title: Observable<string> = of('');
  opened: boolean;
  innerWidth:number;

  username: string;
  isAdmin: boolean;
  isModerator: boolean;
  isDocent: boolean;

  ngOnInit() {
    this.username = this.auth.getToken().username
    const globalRole = this.auth.getToken().globalRole
    this.opened = true;

    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole)
    this.isModerator = Roles.GlobalRole.isModerator(globalRole);
    this.isDocent = this.auth.getToken().courseRoles.find(o => o == Roles.CourseRole.DOCENT)

    this.title = this.titlebar.getTitle();
    this.innerWidth = window.innerWidth;
  }

  /**
   * Deletes cookie and jwt after that user gets logged out
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }

  get showSidebarMenu() {
    return this.innerWidth <= 400;
  }

  /**
   * Listen to onResize and update sidebar visibility settings
   * @param event
   */
  onResize(event){
    this.innerWidth = event.target.innerWidth
  }
}
