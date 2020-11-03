import {Injectable} from '@angular/core';
import {Observable, Subject, BehaviorSubject, Subscription} from 'rxjs';
import {Ticket, User} from '../model/HttpInterfaces';
import {RxStompClient} from '../util/rx-stomp';
import {distinctUntilChanged} from 'rxjs/operators'
import {Message} from 'stompjs';
import {ConferenceService} from './conference.service';
import {AuthService} from "./auth.service";
import {MatDialog} from "@angular/material/dialog";
import {IncomingCallDialogComponent} from "../dialogs/incoming-call-dialog/incoming-call-dialog.component";

/**
 * Service that provides observables that asynchronacally updates tickets, users and privide Conferences to take
 * part in a conference.
 */
@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private dialog: MatDialog;
  private users: Subject<User[]>;
  private tickets: Subject<Ticket[]>;
  private usersInConference: Subject<User[]>;
  private inviteUsers: Subject<boolean>;
  private conferenceWindowHandle: Window;
  private isWindowhandleOpen: Subject<Boolean>;
  private courseId = 0;
  private service = "bigbluebutton"
  incomingCallSubscriptions: Subscription[] = [];
  private heartbeatInterval: number;
  private heartbeatTime: number = 5000
  private stompRx: RxStompClient = null;

  public constructor(private authService: AuthService, private conferenceService: ConferenceService, private mDialog: MatDialog) {
    this.users = new BehaviorSubject<User[]>([]);
    this.isWindowhandleOpen = new Subject<Boolean>();
    this.isWindowhandleOpen.asObservable().pipe(distinctUntilChanged()).subscribe((isOpen) => {
      console.log(isOpen)
        if(!isOpen){
          this.closeConference();
        }
    })
    this.isWindowhandleOpen.next(true)
    this.tickets = new BehaviorSubject<Ticket[]>([]);
    this.usersInConference = new BehaviorSubject<User[]>([]);
    this.inviteUsers = new Subject<boolean>();
    this.conferenceService.getSelectedConferenceSystem().subscribe((service :string) => {
      this.service = service
    })
    this.dialog = mDialog;
    //this.conferenceWindowHandle = new Window();
    setInterval(()=>{
      if(this.conferenceWindowHandle) {
        if (this.conferenceWindowHandle.closed) {
          this.isWindowhandleOpen.next(false)
        } else {
          this.isWindowhandleOpen.next(true)
        }
      }
    },1000)
  }

  /**
   * @return Users of the connected course.
   */
  public getUsers(): Observable<User[]> {
    return this.users.asObservable();
  }

  public getConferenceWindowHandle() {
    return this.isWindowhandleOpen.asObservable();
  }
  /**
   * @return Users in public conferences.
   */
  public getUsersInConference(): Observable<User[]> {
    return this.usersInConference.asObservable();
  }

  public userInviter(): Observable<boolean> {
    return this.inviteUsers.asObservable();
  }

  /**
   * @return Tickets of the connected course.
   */
  public getTickets(): Observable<Ticket[]> {
    return this.tickets.asObservable();
  }

  /**
   * @return True if service is connected to the backend.
   */
  public isJoined() {
    return this.stompRx && this.stompRx.isConnected();
  }

  /**
   * Connect to backend
   * @param courseId The course, e.g., classroom id
   * @return Observable that completes if connected.
   */
  public join(courseId: number) {
    this.courseId = courseId;
    this.stompRx = new RxStompClient(window.origin.replace(/^http(s)?/, 'ws$1') + '/websocket', this.constructHeaders());
    this.stompRx.onConnect(_ => {
      // Handles Conference from tutors / docents to take part in a webconference
      this.listen('/user/' + this.authService.getToken().username + '/classroom/invite').subscribe(m => this.handleInviteMsg(m));
      this.listen('/user/' + this.authService.getToken().username + '/classroom/users').subscribe(m => this.handleUsersMsg(m));
      this.listen('/topic/classroom/' + this.courseId + '/left').subscribe(_m => this.requestUsersUpdate());
      this.listen('/topic/classroom/' + this.courseId + '/joined').subscribe(_m => this.requestUsersUpdate());

      this.listen('/user/' + this.authService.getToken().username + '/classroom/tickets').subscribe(m => this.handleTicketsMsg(m));
      this.listen('/topic/classroom/' + this.courseId + '/ticket/create').subscribe(_m => this.requestTicketsUpdate());
      this.listen('/topic/classroom/' + this.courseId + '/ticket/update').subscribe(_m => this.requestTicketsUpdate());
      this.listen('/topic/classroom/' + this.courseId + '/ticket/remove').subscribe(_m => this.requestTicketsUpdate());

      this.listen('/topic/classroom/' + this.courseId + '/conference/opened').subscribe(_m => this.requestConferenceUsersUpdate());
      this.listen('/user/' + this.authService.getToken().username + '/classroom/opened').subscribe(m => this.handleConferenceOpenedMsg(m));
      this.listen('/topic/classroom/' + this.courseId + '/conference/closed').subscribe(_m => this.requestConferenceUsersUpdate());
      this.listen('/user/' + this.authService.getToken().username + '/classroom/conference/users').subscribe(m => this.handleConferenceUsersMsg(m));
      this.listen('/user/' + this.authService.getToken().username + '/classroom/conference/joined').subscribe(m => this.handleConferenceJoinedMsg(m));
      this.joinCourse();
      this.requestUsersUpdate();
      this.requestConferenceUsersUpdate();
      this.requestTicketsUpdate();

      this.heartbeatInterval = window.setInterval(()=>{
        this.send('/websocket/classroom/heartbeat', {});
      }, this.heartbeatTime)
    });
    this.stompRx.connect();
  }

  /**
   * Disconnects from the endpoint.
   * @return Observable that completes when disconnected.
   */
  public leave() {
    this.send('/websocket/classroom/leave', {courseId: this.courseId});
    clearInterval(this.heartbeatInterval)
    return this.stompRx.disconnect();
  }

  /**
   * Invites user to a conference by following the link provided as href.
   * @param users The users to invite
   */
  public inviteToConference(users: User[]) {
    this.send('/websocket/classroom/conference/invite', {users:users, 'courseid': this.courseId});
  }

  /**
   * Creates a new ticket.
   * @param ticket The ticket to create.
   */
  public createTicket(ticket: Ticket) {
    ticket.courseId = this.courseId;
    this.send('/websocket/classroom/ticket/create', ticket);
  }

  /**
   * Updates an existing ticket.
   * @param ticket The ticket to update.
   */
  public updateTicket(ticket: Ticket) {
    this.send('/websocket/classroom/ticket/update', ticket);
  }

  /**
   * Removes an existing ticket.
   * @param ticket The ticket to remove.
   */
  public removeTicket(ticket: Ticket) {
    ticket.queuePosition = null;
    this.send('/websocket/classroom/ticket/remove', ticket);
  }

  private handleInviteMsg(msg: Message) {
    let body = JSON.parse(msg.body)
    this.dialog.open(IncomingCallDialogComponent, {
      height: 'auto',
      width: 'auto',
      data: {inviter: body.user, cid: body.cid}
    });

  }

  private handleUsersMsg(msg: Message) {
    this.users.next(JSON.parse(msg.body));
  }

  private handleTicketsMsg(msg: Message) {
    this.tickets.next(JSON.parse(msg.body));
  }

  private requestUsersUpdate() {
    this.send('/websocket/classroom/users', {courseId: this.courseId});
  }

  private requestTicketsUpdate() {
    this.send('/websocket/classroom/tickets', {courseId: this.courseId});
  }

  private joinCourse() {
    this.send('/websocket/classroom/join', {courseId: this.courseId});
  }

  private constructHeaders() {
    return {'Auth-Token': this.authService.loadToken()};
  }

  private send(topic: string, body: {}): void {
    this.stompRx.send(topic, body, this.constructHeaders());
  }

  private listen(topic: string): Observable<Message> {
    return this.stompRx.subscribeToTopic(topic, this.constructHeaders());
  }

  public openConference() {
    this.send('/websocket/classroom/conference/open', {service: this.service, courseId: this.courseId});
  }

  public closeConference() {
    if(this.conferenceWindowHandle && !this.conferenceWindowHandle.closed) {
      this.conferenceWindowHandle.close();
    }
    this.send('/websocket/classroom/conference/close', {});
  }

  private requestConferenceUsersUpdate() {
    this.requestUsersUpdate();
    this.send('/websocket/classroom/conference/users', {courseId: this.courseId});
  }

  private handleConferenceUsersMsg(msg: Message) {
    this.usersInConference.next(JSON.parse(msg.body))
  }

  private handleConferenceOpenedMsg(msg: Message) {
    this.inviteUsers.next(true)
    this.conferenceWindowHandle = window.open(JSON.parse(msg.body).href)
  }

  private handleConferenceJoinedMsg(msg: Message) {
    this.conferenceWindowHandle = window.open(JSON.parse(msg.body).href)
  }

  public joinConference(user: User, mid:number = 0) {
    this.send('/websocket/classroom/conference/join', {user: user, mid: mid, courseId: this.courseId});
  }

  public showConference() {
    this.send('/websocket/classroom/conference/show', {});
  }

  public hideConference() {
    this.send('/websocket/classroom/conference/hide', {});
  }

  public showUser() {
    this.send('/websocket/classroom/user/show', {courseId: this.courseId});
  }

  public hideUser() {
    this.send('/websocket/classroom/user/hide', {courseId: this.courseId});
  }
}
