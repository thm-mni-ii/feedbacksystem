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
  private personalConferenceLink: BehaviorSubject<string>;
  private bbbConferenceLink: BehaviorSubject<object>;
  private conference: BehaviorSubject<Conference>;
  public selectedConferenceSystem: BehaviorSubject<string>;


  public conferenceTimeoutTimer: Subscription;
  public constructor() {
     this.personalConferenceLink = new BehaviorSubject<string>(null);
     this.bbbConferenceLink = new  BehaviorSubject<object>(null);
     this.selectedConferenceSystem = new BehaviorSubject<string>(ConferenceSystems.BigBlueButton);
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
