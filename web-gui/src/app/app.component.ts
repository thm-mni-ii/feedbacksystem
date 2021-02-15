import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from './service/auth.service';
import {GoToService} from './service/goto.service';

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

  ngOnInit(): void {
    this.authService.startTokenAutoRefresh();
  }
}
