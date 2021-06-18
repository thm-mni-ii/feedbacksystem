import {Injectable} from '@angular/core';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {ExternalClassroomHandlingService} from './external-classroom-handling-service';
import {AuthService} from './auth.service';
import {MatDialog} from '@angular/material/dialog';

/**
 * Service that provides observables that asynchronacally updates tickets, users and privide Conferences to take
 * part in a conference.
 */
@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private dialog: MatDialog;
  private conferenceWindowHandle: Window;
  private isWindowHandleOpen: Subject<Boolean>;
  private courseId = 0;
  private service = 'digital-classroom';

  public constructor(private authService: AuthService,
                     private classRoomHandlingService: ExternalClassroomHandlingService,
                     private mDialog: MatDialog) {
    this.isWindowHandleOpen = new Subject<Boolean>();
    this.isWindowHandleOpen.asObservable().pipe(distinctUntilChanged()).subscribe((isOpen) => {
        if (!isOpen) {
          this.leaveClassroom();
        }
    });
    this.isWindowHandleOpen.next(true);
    this.classRoomHandlingService
      .getSelectedConferenceSystem().subscribe((service: string) => {
      this.service = service;
    });
    this.dialog = mDialog;
    // this.conferenceWindowHandle = new Window();
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

  public getClassroomWindowHandle() {
    return this.isWindowHandleOpen.asObservable();
  }

  /**
   * Connect to backend
   * @param courseId The course, e.g., classroom id
   * @return Observable that completes if connected.
   */
  public join(courseId: number) {
    this.authService.getToken().id
    this.courseId = courseId;
  };

  public leaveClassroom() {

  }

}
