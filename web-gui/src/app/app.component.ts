import {Component} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DataprivacyDialogComponent} from './components/dataprivacy-dialog/dataprivacy-dialog.component';
import {ImpressumDialogComponent} from './components/impressum-dialog/impressum-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  constructor(private dialog: MatDialog) {
  }


  showDataprivacy() {
    this.dialog.open(DataprivacyDialogComponent, {data: {onlyForShow: true}});
  }

  showImpressum() {
    this.dialog.open(ImpressumDialogComponent);
  }


}
