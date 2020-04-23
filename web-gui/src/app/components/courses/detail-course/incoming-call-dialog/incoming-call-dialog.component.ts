import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DatabaseService} from '../../../../service/database.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../../../interfaces/HttpInterfaces';

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.scss']
})
export class IncomingCallDialogComponent implements OnInit {
  participants: any[];
  conferenceURL: string;
  audio: HTMLAudioElement;
  caller: User;
  constructor(public dialogRef: MatDialogRef<IncomingCallDialogComponent>, private db: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.participants = this.data.participants;
    this.conferenceURL = this.data.conferenceURL;
    this.caller = this.data.caller;
    const notification = new Notification('Konferenzeinladung Feedbacksystem',
      {body: 'Sie werden zu einem Konferenzanruf eingeladen.'});
    notification.onclick = () => window.focus();
    notification.onclose = () => window.focus();
    this.audio = new Audio();
    this.audio.src = '../../../../assets/classic_phone.mp3';
    this.audio.load();
    this.audio.play();
    this.dialogRef.afterClosed().subscribe(next => {
      this.audio.pause();
      this.audio.currentTime = 0;
    });
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        // The tab has become visible so clear the now-stale Notification.
        notification.close();
      }
    });
  }

  public acceptCall() {
    this.openUrlInNewWindow(this.conferenceURL);
    this.dialogRef.close();
  }

  public declineCall() {
    this.dialogRef.close();
  }

  public openUrlInNewWindow(url: string) {
    window.open(url, '_blank');
  }
}
