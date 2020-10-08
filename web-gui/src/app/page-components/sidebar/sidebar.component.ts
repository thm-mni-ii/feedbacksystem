import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {TitlebarService} from '../../service/titlebar.service';
import {Subscription, Observable, of} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {Roles} from "../../model/Roles";
import {MatDialog} from "@angular/material/dialog";
import {DataprivacyDialogComponent} from "../../dialogs/dataprivacy-dialog/dataprivacy-dialog.component";
import {ImpressumDialogComponent} from "../../dialogs/impressum-dialog/impressum-dialog.component";

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
              private titlebar: TitlebarService,
              private dialog: MatDialog) {
  }

  title: Observable<string> = of('');
  opened: boolean;
  innerWidth:number;

  username: string;
  isAdmin: boolean;
  isModerator: boolean;

  ngOnInit() {
    this.username = this.auth.getToken().username
    const globalRole = this.auth.getToken().globalRole
    this.opened = true;

    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole)
    this.isModerator = Roles.GlobalRole.isModerator(globalRole);

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

  /**
   * Show data privay dialog
   */
  showDataprivacy() {
    this.dialog.open(DataprivacyDialogComponent, {data: {onlyForShow: true}});
  }
  /**
   * Show impressum dialog
   */
  showImpressum() {
    this.dialog.open(ImpressumDialogComponent);
  }
}
