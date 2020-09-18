import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DatabaseService} from '../../../../service/database.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConferenceInvitation, User} from '../../../../interfaces/HttpInterfaces';
import {ConferenceSystems} from '../../../../util/ConferenceSystems';
import {ConferenceService} from '../../../../service/conference.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.scss']
})
export class IncomingCallDialogComponent implements OnInit {
  invitation: ConferenceInvitation;
  audio: HTMLAudioElement;
  conferenceURL: string;
  constructor(public dialogRef: MatDialogRef<IncomingCallDialogComponent>, public conferenceService: ConferenceService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.invitation = this.data.invitation.invitation;
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
    if (this.invitation.service == 'bigbluebutton') {
      this.conferenceService.getBBBConferenceInvitationLink(this.invitation.meetingId,
        // @ts-ignore
        this.invitation.moderatorPassword).pipe(first()).subscribe(n => this.openUrlInNewWindow(n.href));
    } else if (this.invitation.service == 'jitsi') {
      this.conferenceURL = this.invitation.href;
    }

    this.dialogRef.close();
  }

  public declineCall() {
    this.dialogRef.close();
  }

  public openUrlInNewWindow(url: string) {
    window.open(url, '_blank');
  }
}
