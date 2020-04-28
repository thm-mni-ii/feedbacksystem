import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {flatMap} from 'rxjs/operators';

/**
 * Handles the creation and retrivement of conference links.
 * @author Andrej Sajenko
 */
@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private personalConferenceLink: BehaviorSubject<string>;
  private sessionConferenceLinks: BehaviorSubject<Map<string, string>>;
  private personalLinksRecieved = false;
  private conferenceLinksRecieved = false;
  public selectedConferenceSystem: BehaviorSubject<String> = new BehaviorSubject<String>('bigbluebutton');
  private conferenceWindowHandle: Window;
  public constructor(private http: HttpClient) {
    this.personalConferenceLink = new BehaviorSubject<string>(null);
    this.sessionConferenceLinks = new BehaviorSubject<Map<string, string>>(null);
  }

  public openWindowIfClosed(href: string) {
    if (!this.conferenceWindowHandle || this.conferenceWindowHandle.closed) {
      this.conferenceWindowHandle = window.open(href, '_blank');
    }
  }
  public getSelectedConferenceSystem(): Observable<String> {
    return this.selectedConferenceSystem.asObservable();
  }

  public setSelectedConferenceSystem(serviceName: String) {
    return this.selectedConferenceSystem.next(serviceName);
  }

  public getConferenceInviteHref() {
    if (this.selectedConferenceSystem.value == 'jitsi') {
      return this.personalConferenceLink.value;
    } else if (this.selectedConferenceSystem.value == 'bigbluebutton') {
      return this.sessionConferenceLinks.value.get('href');
    }
  }
  /**
   * Get all created open conferences of a course.
   * @param courseId The course id.
   * @return The URI to to follow to get to the conference.
   */
  public getConferences(courseId: number): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/courses/' + courseId + '/conferences');
  }

  /**
   * Creates multiple conference links for a course. These conferences can be later retrived by this.getConferences().
   * @param courseId The course id
   * @param countOfConferences The amount of conference links that must be created.
   * @return Observable that completes if the request is done.
   */
  public openConference(courseId): Observable<any> {
    return this.http.post('/api/v1/courses/' + courseId + '/conference/open', {href: this.getConferenceInviteHref()});
  }

  /**
   * Creates multiple conference links for a course. These conferences can be later retrived by this.getConferences().
   * @param courseId The course id
   * @param countOfConferences The amount of conference links that must be created.
   * @return Observable that completes if the request is done.
   */
  public closeConference(courseId): Observable<any> {
    return this.http.post('/api/v1/courses/' + courseId + '/conference/close', {href: this.getConferenceInviteHref()});
  }

  /**
   * @return Returns a personal conference link.
   */
  public getSingleConferenceLink(service: String): Observable<string> {
    if (this.personalLinksRecieved) {
      return this.personalConferenceLink.asObservable();
    } else {
      return this.http.post<any>('/api/v1/courses/meeting', {service: service})
        .pipe(flatMap(res => {
          this.personalLinksRecieved = true;
          this.personalConferenceLink.next(res.href);
          return this.personalConferenceLink.asObservable();
        }));
    }
  }
  /**
   * @return Returns a personal conference link.
   */
  public getConferenceInvitationLinks(service: String): Observable<Map<string, string>> {
    if (this.conferenceLinksRecieved) {
      return this.sessionConferenceLinks.asObservable();
    } else {
      return this.http.post<any>('/api/v1/courses/meeting', {service: service})
        .pipe(flatMap(res => {
          this.conferenceLinksRecieved = true;
          const links: Map<string, string> = new Map<string, string>();
          links.set('href', res.href);
          links.set('mod_href', res.mod_href);
          this.sessionConferenceLinks.next(links);
          return this.sessionConferenceLinks.asObservable();
        }));
    }
  }
}
