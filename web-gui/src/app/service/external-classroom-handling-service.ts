import {Injectable} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
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
  public conferenceTimeoutTimer: Subscription;

  public constructor() {
     this.personalConferenceLink = new BehaviorSubject<string>(null);
     this.bbbConferenceLink = new  BehaviorSubject<object>(null);
     this.conference = new BehaviorSubject<Conference>(null);
  }
}
