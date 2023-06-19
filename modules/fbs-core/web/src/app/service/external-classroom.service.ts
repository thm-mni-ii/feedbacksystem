import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { HttpClient } from "@angular/common/http";
/**
 * Service that provides observables that asynchronacally updates tickets, users and privide Conferences to take
 * part in a conference.
 */
@Injectable({
  providedIn: "root",
})
export class ExternalClassroomService {
  private conferenceWindowHandle: Window;
  private isWindowHandleOpen: Subject<Boolean>;
  private courseId = 0;

  public constructor(private dialog: MatDialog, private http: HttpClient) {
    this.isWindowHandleOpen = new Subject<Boolean>();
    this.isWindowHandleOpen
      .asObservable()
      .pipe(distinctUntilChanged())
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.leaveClassroom();
        }
      });
    this.isWindowHandleOpen.next(true);
    setInterval(() => {
      if (this.conferenceWindowHandle) {
        if (this.conferenceWindowHandle.closed) {
          this.isWindowHandleOpen.next(false);
        } else {
          this.isWindowHandleOpen.next(true);
        }
      }
    }, 1000);
  }

  public isJoined() {
    return this.conferenceWindowHandle && !this.conferenceWindowHandle.closed;
  }

  /**
   * Connect to backend
   * @param courseId The course, e.g., classroom id
   * @return Observable that completes if connected.
   */
  public join(courseId: number) {
    if (!this.conferenceWindowHandle || this.conferenceWindowHandle.closed) {
      this.courseId = courseId;
      this.http
        .get<String>(`/api/v1/classroom/${this.courseId}/join`)
        .subscribe((url) => {
          this.conferenceWindowHandle = open(url.toString());
        });
    } else {
      this.conferenceWindowHandle.focus();
    }
  }

  /**
   * Not called
   */
  public leaveClassroom() {
    this.http.get<string>(`/api/v1/classroom/${this.courseId}/leave`);
  }
}
