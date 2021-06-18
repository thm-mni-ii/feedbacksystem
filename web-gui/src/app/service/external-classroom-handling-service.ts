import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject, Subscription} from 'rxjs';
import {ConferenceSystems} from '../util/ConferenceSystems';
import {Conference} from '../model/Conference';

/**
 * Handles the creation and retrivement of conference links.
 * @author Andrej Sajenko & Dominik Kröll
 */
@Injectable({
  providedIn: 'root'
})
export class ExternalClassroomHandlingService {
  private personalConferenceLink: BehaviorSubject<string>;
  private bbbConferenceLink: BehaviorSubject<object>;
  private conference: BehaviorSubject<Conference>;
  public selectedConferenceSystem: BehaviorSubject<string>;
  public conferenceTimeoutTimer: Subscription;

  public constructor() {
     this.personalConferenceLink = new BehaviorSubject<string>(null);
     this.bbbConferenceLink = new  BehaviorSubject<object>(null);
     this.selectedConferenceSystem = new BehaviorSubject<string>(ConferenceSystems.DigitalClassroom);
     this.conference = new BehaviorSubject<Conference>(null);
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
}
