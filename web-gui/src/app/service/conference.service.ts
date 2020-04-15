import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';

/**
 * Handles the creation and retrivement of conference links.
 * @author Andrej Sajenko
 */
@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  public constructor(private http: HttpClient) {
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
  public createConferences(courseId: number, countOfConferences: number): Observable<any> {
    return this.http.post('/api/v1/courses/' + courseId + '/conferences', {
      count: countOfConferences
    });
  }

  /**
   * Creates a single conference that will not be registered, i.e., it is not retrivable by this.getConferences().
   * @return Observable that contains the URI to to follow to get to the conference.
   */
  public createSingleConference(): Observable<string> {
    return this.http.post<any>('/api/v1/courses/meeting', {})
      .pipe(flatMap<any, string>(res => {
        return res.header.get('Location');
      }));
  }
}
