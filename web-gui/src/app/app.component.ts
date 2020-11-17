import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DataprivacyDialogComponent} from './dialogs/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './dialogs/impressum-dialog/impressum-dialog.component';
import {AuthService} from "./service/auth.service";

/**
 * Component that routes from login to app
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private dialog: MatDialog, private authService: AuthService) {
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

  ngOnInit(): void {
    this.authService.startTokenAutoRefresh();
  }
}
