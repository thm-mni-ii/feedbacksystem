import {Component, OnInit} from '@angular/core';
import {TitlebarService} from '../../../service/titlebar.service';

/**
 * Creation of new Checker system
 */
@Component({
  selector: 'app-admin-checker',
  templateUrl: './admin-checker.component.html',
  styleUrls: ['./admin-checker.component.scss']
})
export class AdminCheckerComponent implements OnInit {

  constructor(private titlebar: TitlebarService) {
  }

  ngOnInit() {
    this.titlebar.emitTitle('Checker');
  }

}
