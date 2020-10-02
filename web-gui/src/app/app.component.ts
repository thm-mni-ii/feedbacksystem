import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DataprivacyDialogComponent} from './dialogs/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './dialogs/impressum-dialog/impressum-dialog.component';

/**
 * Component that routes from login to app
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private dialog: MatDialog) {
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
