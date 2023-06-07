import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
@Component({
  selector: "app-submission-text",
  templateUrl: "./submission-text.component.html",
  styleUrls: ["./submission-text.component.scss"],
})
export class SubmissionTextComponent implements OnInit {
  toSubmit = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly translocoService: TranslocoService) {}

  titleText: string ;

  ngOnInit() {
    
      this.translocoService.selectTranslate('submission-text').subscribe(value => 
        this.titleText = value
        )
     
    
  }

  updateSubmission(event) {
    this.update.emit({ content: event });
  }
}
