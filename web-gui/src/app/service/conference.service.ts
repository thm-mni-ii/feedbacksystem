import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject} from 'rxjs';
import {flatMap} from 'rxjs/operators';
import {ConferenceSystems} from '../util/ConferenceSystems';
import {ConferenceInvitation} from '../interfaces/HttpInterfaces';

/**
 * Handles the creation and retrivement of conference links.
 * @author Andrej Sajenko
 */
@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private personalConferenceLink: BehaviorSubject<string>;
  private bbbInvitationLink: BehaviorSubject<object>;
  private conferenceInvitation: BehaviorSubject<ConferenceInvitation>;
  public selectedConferenceSystem: BehaviorSubject<string>;
  private personalLinksRecieved = false;
  private conferenceWindowHandle: Window;
  public constructor(private http: HttpClient) {
     this.personalConferenceLink = new BehaviorSubject<string>(null);
     this.bbbInvitationLink = new  BehaviorSubject<object>(null);
     this.selectedConferenceSystem = new BehaviorSubject<string>(ConferenceSystems.BigBlueButton);
     this.conferenceInvitation = new BehaviorSubject<ConferenceInvitation>(null);
  }

  public openWindowIfClosed(href: string) {
    if (!this.conferenceWindowHandle || this.conferenceWindowHandle.closed) {
      this.conferenceWindowHandle = window.open(href, '_blank');
    }
  }
  public getSelectedConferenceSystem(): Observable<string> {
    return this.selectedConferenceSystem.asObservable();
  }

  public setSelectedConferenceSystem(service: string) {
    return this.selectedConferenceSystem.next(service);
  }

  public getConferenceInvitation(): Observable<ConferenceInvitation> {
    return this.conferenceInvitation.asObservable();
  }

  /**
   * @param service Conference system to use
   * @return Returns a personal conference link.
   */
  public getSingleConferenceLink(service: string): Observable<string> {
    if (this.personalLinksRecieved && this.conferenceWindowHandle && !this.conferenceWindowHandle.closed) {
      return this.personalConferenceLink.asObservable();
    } else {
      return this.http.post<any>('/api/v1/courses/meeting', {service: service})
        .pipe(flatMap(res => {
          this.personalLinksRecieved = true;
          this.personalConferenceLink.next(res.href);
          // remove mod href and mod password from invitation
          if (res.service == ConferenceSystems.BigBlueButton) {
            res.href = undefined;
            res.moderatorPassword = undefined;
          }
          this.conferenceInvitation.next(res);
          return this.personalConferenceLink.asObservable();
        }));
    }
  }

  /**
   * This Route lets a user generate its own personal Big Blue Button invitation link personalised by FullName
   * @param meetingId id that the user receives either bei direct call or by open conferences list
   * @param meetingPassword password that the user receives either bei direct call or by open conferences list
   * @return Returns a personal conference link to a BBB conference.
   */
  public getBBBConferenceInvitationLink(meetingId: String, meetingPassword: String): Observable<object> {
      return this.http.post<object>('/api/v1/courses/meeting/bbb/invite',
        {meetingId: meetingId, meetingPassword: meetingPassword})
        .pipe(flatMap(res => {
          this.bbbInvitationLink.next(res);
          return this.bbbInvitationLink.asObservable();
        }));
    }
}
