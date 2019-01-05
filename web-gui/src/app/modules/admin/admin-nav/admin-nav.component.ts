import {Component} from '@angular/core';
import {MatSnackBar} from "@angular/material";
import {AuthService} from "../../../service/auth.service";
import {Router} from "@angular/router";

/**
 * Navigation panel on the left site.
 * Admin can navigate to different pages.
 */
@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent {

  constructor(private snackbar: MatSnackBar, private auth: AuthService, private router: Router) {
  }


  logout() {
    this.auth.logout();
    this.router.navigate(['']);
    this.snackbar.open("Du hast dich ausgeloggt", "OK", {duration: 5000});
  }

}
