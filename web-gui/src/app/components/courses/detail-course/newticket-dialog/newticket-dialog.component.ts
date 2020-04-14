import {Component, Inject, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-newticket-dialog',
  templateUrl: './newticket-dialog.component.html',
  styleUrls: ['./newticket-dialog.component.scss']
})
export class NewticketDialogComponent implements OnInit {
  courseID:number;

  ticketTitle: FormGroup;
  ticketDesc: FormGroup;
  ticketPriority: FormGroup;

  subscription: Subscription = new Subscription();

  newTicketTitle:string;
  newTicketDesc:string;
  newTicketPriority:number;

  constructor(private _formBuilder: FormBuilder,@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<NewticketDialogComponent>) { }

  ngOnInit(): void {
    this.courseID = this.data.courseID;
    // Check if step is done
    this.ticketTitle = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.ticketDesc = this._formBuilder.group({
      secondCtrl: ['']
    });
    this.ticketPriority = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });

    this.subscription.add(this.ticketTitle.valueChanges.subscribe(
      (inputStep1: { firstCtrl: string }) => {
        if(inputStep1.firstCtrl){
          if (inputStep1.firstCtrl.match('^ $')) {
            inputStep1.firstCtrl = '';
          }
          this.newTicketTitle = inputStep1.firstCtrl;
        }
      }));
    this.subscription.add(this.ticketDesc.valueChanges.subscribe(
      (inputStep2: { secondCtrl: string }) => {
        if(inputStep2.secondCtrl){
          if (inputStep2.secondCtrl.match('^ $')) {
            inputStep2.secondCtrl = '';
          }
          this.newTicketDesc = inputStep2.secondCtrl;
        }
      }));
    this.subscription.add(this.ticketPriority.valueChanges.subscribe(
      (inputStep3: { thirdCtrl: number }) => {
        if(inputStep3.thirdCtrl){
            inputStep3.thirdCtrl = 5;
          this.newTicketPriority = inputStep3.thirdCtrl;
        }
      }));
  }

  createTicket(){
    //todo: service anbindung
    console.log(this.newTicketTitle)
    console.log(this.newTicketDesc)
    console.log(this.newTicketPriority)
    this.dialogRef.close();
  }
}
