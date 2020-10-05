import {Component, Input, OnInit} from '@angular/core';
import {MatTabChangeEvent} from "@angular/material/tabs";
import {DomSanitizer} from "@angular/platform-browser";
import {CourseTaskEvaluation} from "../../../model/HttpInterfaces";
import {MiscService} from "../../../service/misc.service";

@Component({
  selector: 'app-submission-result',
  templateUrl: './submission-result.component.html',
  styleUrls: ['./submission-result.component.scss']
})
export class SubmissionResultComponent implements OnInit {


  @Input() taskResults: CourseTaskEvaluation[];
  @Input() taskPassed: string;

  public taskResultList: any = [];

  constructor(private sanitizer: DomSanitizer, private misc: MiscService) {
    this.taskResultList = []
  }

  parseResultString(resultstring: string): any[]{
    if (resultstring == null) return [];
    try {
      let obj = JSON.parse(resultstring);
      if (obj == null)
        return null;
      else
        return obj
    } catch (e) {
      return [];
    }
  }

  public isBase64(data){
    return this.misc.isBase64(data)
  }

  getImageOfData(data){
    return this.sanitizer.bypassSecurityTrustUrl("data:Image/*;base64,"+data);
  }

  ngOnInit() {
  }

  tabChanged(event: MatTabChangeEvent) {

  }
}
