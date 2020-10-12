import { Component, OnInit } from '@angular/core';
import {CheckerConfig} from "../../model/CheckerConfig";
import {Observable, of} from "rxjs"
import {flatMap} from "rxjs/operators"
import {CHECKERCONFIG} from "../../mock-data/mock-checker-config";
import {CheckerService} from "../../service/checker.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-configuration-list',
  templateUrl: './configuration-list.component.html',
  styleUrls: ['./configuration-list.component.scss']
})
export class ConfigurationListComponent implements OnInit {
  configurations: Observable<CheckerConfig[]> = of(CHECKERCONFIG)
  courseId: number
  taskId: number

  constructor(private checkerService: CheckerService, private route: ActivatedRoute,
              ) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => {
        this.courseId = params.cid
        this.taskId = params.tid
        this.configurations = this.checkerService.getChecker(this.courseId, this.taskId)
      });
  }

  isAuthorized(): boolean {
    return true // TODO:
  }

  addConfig() {
    // this.checkerService.createChecker(this.courseId, this.taskId, )
    //   .subscribe(res => {
    //   console.log(res)
    // })
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
