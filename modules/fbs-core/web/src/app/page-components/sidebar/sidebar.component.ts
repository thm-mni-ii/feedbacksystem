import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../service/auth.service";
import { UserService } from "src/app/service/user.service";
import { TitlebarService } from "../../service/titlebar.service";
import { Observable, of } from "rxjs";
import { Roles } from "../../model/Roles";
import { MatDialog } from "@angular/material/dialog";
import { DataprivacyDialogComponent } from "../../dialogs/dataprivacy-dialog/dataprivacy-dialog.component";
import { ImpressumDialogComponent } from "../../dialogs/impressum-dialog/impressum-dialog.component";
import { FeedbackAppService } from "../../service/feedback-app.service";
import { User } from "src/app/model/User";

/**
 * Root component shows sidenav and titlebar
 */
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
    private titlebar: TitlebarService,
    private dialog: MatDialog,
    private feedbackAppService: FeedbackAppService,
    private userservice: UserService
  ) {}

  title: Observable<string> = of("");
  opened: boolean;
  innerWidth: number;
  userID: number;
  username: string;
  isAdmin: boolean;
  isModerator: boolean;
  showAnalytics: boolean;
  user: User;

  ngOnInit() {
    this.userID = this.auth.getToken().id;
    this.userservice.getUser(this.userID).subscribe(
      (user) => (this.user = user),
      (error) => console.log(error)
    );
    const globalRole = this.auth.getToken().globalRole;
    this.opened = true;

    this.isAdmin = Roles.GlobalRole.isAdmin(globalRole);
    this.isModerator = Roles.GlobalRole.isModerator(globalRole);

    this.title = this.titlebar.getTitle();
    this.innerWidth = window.innerWidth;

    this.showAnalytics = Object.values(this.auth.getToken().courseRoles).some(
      (e) => Roles.CourseRole.isDocent(e) || Roles.CourseRole.isTutor(e)
    );
  }

  /**
   * Deletes cookie and jwt after that user gets logged out
   */
  logout() {
    this.auth.logout();
    this.router.navigate(["login"]);
  }

  get showSidebarMenu() {
    return this.innerWidth <= 400;
  }

  /**
   * Listen to onResize and update sidebar visibility settings
   * @param event
   */
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }

  /**
   * Show data privay dialog
   */
  showDataprivacy() {
    this.dialog.open(DataprivacyDialogComponent, {
      data: { onlyForShow: true },
    });
  }
  /**
   * Show impressum dialog
   */
  showImpressum() {
    this.dialog.open(ImpressumDialogComponent);
  }

  /**
   * Link to Feedback App
   */
  goToFBA() {
    this.feedbackAppService.getToken().subscribe((token) => {
      localStorage.setItem("flutter.authToken", JSON.stringify(token));
      window.open("/feedbackApp/");
    });
  }

  moveAndHideSidebar(route: string) {
    console.log("moveAndHideSidebar");
    this.router.navigate([route]);
    this.opened = false;
  }
}
