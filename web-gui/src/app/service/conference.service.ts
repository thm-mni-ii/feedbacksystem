import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject,  timer, Subscription} from 'rxjs';
import {flatMap, first} from 'rxjs/operators';
import {ConferenceSystems} from '../util/ConferenceSystems';
import {Conference} from "../model/HttpInterfaces";

/**
 * Handles the creation and retrivement of conference links.
 * @author Andrej Sajenko
 */
@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private timoutTime = 600000; // 10 minutes
  private personalConferenceLink: BehaviorSubject<string>;
  private bbbConferenceLink: BehaviorSubject<object>;
  private conference: BehaviorSubject<Conference>;
  public selectedConferenceSystem: BehaviorSubject<string>;
  private personalLinksRecieved = false;
  private conferenceWindowHandle: Window;
  public conferenceTimeoutTimer: Subscription;
  public constructor(private http: HttpClient) {
     this.personalConferenceLink = new BehaviorSubject<string>(null);
     this.bbbConferenceLink = new  BehaviorSubject<object>(null);
     this.selectedConferenceSystem = new BehaviorSubject<string>(ConferenceSystems.BigBlueButton);
     this.conference = new BehaviorSubject<Conference>(null);
  }

  public openWindowIfClosed(href: string): Window | undefined {
    if (!this.conferenceWindowHandle || this.conferenceWindowHandle.closed) {
      this.conferenceWindowHandle = window.open(href, '_blank');
      return this.conferenceWindowHandle;
    } else if (this.conferenceWindowHandle && !this.conferenceWindowHandle.closed) {
      return this.conferenceWindowHandle;
    }
  }
  public getSelectedConferenceSystem(): Observable<string> {
    return this.selectedConferenceSystem.asObservable();
  }

  public setSelectedConferenceSystem(service: string) {
    return this.selectedConferenceSystem.next(service);
  }

  public getConferenceConference(): Observable<Conference> {
    return this.conference.asObservable();
  }

  /**
   * This function recieves a conference link to the choosen Conference system.
   * It also sets the Conference to send to other users.
   * @param service Conference system to use
   * @return Returns a personal conference link.
   */
  public getSingleConferenceLink(service: string): Observable<string> {
    if (this.personalLinksRecieved) {
      return this.personalConferenceLink.asObservable();
    } else {
      return this.http.post<any>('/api/v1/classroom/conference', {service: service})
        .pipe(flatMap(res => {
          this.personalLinksRecieved = true;
          this.personalConferenceLink.next(res.href);
          // remove mod href and mod password from Conference
          if (res.service == ConferenceSystems.BigBlueButton) {
            res.href = undefined;
          }
          this.conference.next(res);
          return this.personalConferenceLink.asObservable();
        }));
    }
  }

  /**
   * This Route lets a user generate its own personal Big Blue Button Conference link personalised by FullName
   * @param meetingId id that the user receives either bei direct call or by open conferences list
   * @param meetingPassword password that the user receives either bei direct call or by open conferences list
   * @return Returns a personal conference link to a BBB conference.
   */
  public getBBBConferenceConferenceLink(meetingId: String, meetingPassword: String): Observable<object> {
    return this.http.post<object>('/api/v1/classroom/conference/bigbluebutton/invite',
      {meetingId: meetingId, meetingPassword: meetingPassword})
      .pipe(flatMap(res => {
        this.bbbConferenceLink.next(res);
        return this.bbbConferenceLink.asObservable();
      }));
  }

  public clearConferenceRoom() {
    this.personalLinksRecieved = false;
  }

  public startTimeout() {
    this.conferenceTimeoutTimer = timer(this.timoutTime).pipe(first()).subscribe(_ => this.clearConferenceRoom());
  }

  public stopTimeout() {
    if (this.conferenceTimeoutTimer) {
      this.conferenceTimeoutTimer.unsubscribe();
    }
  }
}
