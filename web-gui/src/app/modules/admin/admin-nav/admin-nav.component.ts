import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatSnackBar} from "@angular/material";
import {AuthService} from "../../../service/auth.service";

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private snackbar: MatSnackBar,
              private auth: AuthService) {
  }


  logout() {
    this.auth.logout();
    this.snackbar.open("Du hast dich ausgeloggt", "OK", {duration: 5000});
  }

}
