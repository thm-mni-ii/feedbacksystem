import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ClassroomService} from '../../service/classroom.service';
import {User} from '../../model/User';

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.scss']
})
export class IncomingCallDialogComponent implements OnInit {
  inviter: User;
  cid: number;
  audio: HTMLAudioElement;
  conferenceURL: string;
  constructor(public dialogRef: MatDialogRef<IncomingCallDialogComponent>, public classroomService: ClassroomService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.inviter = this.data.inviter;
    this.cid = this.data.cid;
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
  // todo: fix string constants ( enum didnt work)
  public acceptCall() {
    this.classroomService.joinConference(this.inviter, this.cid);
    this.dialogRef.close();
  }

  public declineCall() {
    this.dialogRef.close();
  }
}
