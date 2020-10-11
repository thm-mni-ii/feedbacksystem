import { Component, OnInit } from '@angular/core';
import {CheckerConfig} from "../../model/CheckerConfig";
import {Observable, of} from "rxjs"
import {flatMap} from "rxjs/operators"
import {CHECKERCONFIG} from "../../mock-data/mock-checker-config";

@Component({
  selector: 'app-configuration-list',
  templateUrl: './configuration-list.component.html',
  styleUrls: ['./configuration-list.component.scss']
})
export class ConfigurationListComponent implements OnInit {
  configurations: Observable<CheckerConfig[]> = of(CHECKERCONFIG)

  constructor() { }

  ngOnInit(): void {
  }

  isAuthorized(): boolean {
    return true // TODO:
  }

  addConfig() {

  }

  editConfig() {

  }

  deleteConfig() {

  }

  downloadMainFile() {

  }

  downloadSecondaryFile() {

  }
}
