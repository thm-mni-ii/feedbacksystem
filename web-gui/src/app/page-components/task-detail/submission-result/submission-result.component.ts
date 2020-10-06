import {Component, Input, OnInit} from '@angular/core';
import {MatTabChangeEvent} from "@angular/material/tabs";
import {CheckResult} from "../../../model/CheckResult";

@Component({
  selector: 'app-submission-result',
  templateUrl: './submission-result.component.html',
  styleUrls: ['./submission-result.component.scss']
})
export class SubmissionResultComponent implements OnInit {
  @Input() taskResults: CheckResult[];

  public taskResultList: any = [];

  constructor(){
  }

  ngOnInit() {
  }

  tabChanged(event: MatTabChangeEvent) {

  }
}
