import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfInvite, Ticket, User} from '../interfaces/HttpInterfaces';
import {RxStompClient} from '../util/rx-stomp';
import {UserService} from './user.service';
import {Message} from 'stompjs';

/**
 * Service that provides observables that asynchronacally updates tickets, users and privide invitations to take
 * part in a conference.
 */
@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private users: Subject<User[]> = new Subject<User[]>();
  private tickets: Subject<Ticket[]> = new Subject<Ticket[]>();
  private invitations: Subject<ConfInvite> = new Subject<ConfInvite>();

  private courseId = 0;
  private stompRx: RxStompClient = null;

  constructor(private user: UserService) {}

  /**
   * @return Users of the connected course.
   */
  getUsers(): Observable<User[]> {
    return this.users.asObservable();
  }
  /**
   * @return Tickets of the connected course.
   */
  getTickets(): Observable<Ticket[]> {
    return this.tickets.asObservable();
  }
  /**
   * @return Get invitations to take part in a conference
   */
  getInvitations(): Observable<ConfInvite> {
    return this.invitations.asObservable();
  }

  /**
   * @return True if service is connected to the backend.
   */
  isJoined() {
    return this.stompRx.isConnected();
  }
  /**
   * Connect to backend
   * @param courseId The course, e.g., classroom id
   * @return Observable that completes if connected.
   */
  join(courseId: number): Observable<void> {
    this.courseId = courseId;
    this.stompRx = new RxStompClient('https://localhost:8080/websocket');

    return new Observable<void>(c => {
      this.stompRx.connect(this.constructHeaders()).subscribe(_ => {

        // Handles invitation from tutors / docents to take part in a webconference
        this.listen('/user/' + this.user.getUsername() + '/classroom/invite').subscribe(this.handleInviteMsg);
        this.listen('/user/' + this.user.getUsername() + '/classroom/users').subscribe(this.handleUsersMsg);
        this.listen( '/topic/classroom/' + this.courseId + '/left').subscribe(this.requestUsersUpdate);
        this.listen( '/topic/classroom/' + this.courseId + '/join').subscribe(this.requestUsersUpdate);
        this.requestUsersUpdate();
        this.listen('/topic/classroom/' + this.courseId + '/tickets').subscribe(this.handleTicketsMsg);
        this.listen('/topic/classroom/' + this.courseId + '/ticket/create').subscribe(this.requestTicketsUpdate);
        this.listen('/topic/classroom/' + this.courseId + '/ticket/update').subscribe(this.requestTicketsUpdate);
        this.listen('/topic/classroom/' + this.courseId + '/ticket/remove').subscribe(this.requestTicketsUpdate);
        this.requestTicketsUpdate();
        this.joinCourse();

        c.next();
        c.complete();
      }, c.error);
    });
  }
  /**
   * Disconnects from the endpoint.
   * @return Observable that completes when disconnected.
   */
  leave(): Observable<void> {
    return this.stompRx.disconnect(this.constructHeaders());
  }

  /**
   * Invites user to a conference by following the link provided as href.
   * @param href The link of the conference server
   * @param users The users to invite
   */
  inviteToConference(href: string, users: {username: string; prename: string; surname: string}[]) {
    this.send('/websocket/classroom/invite', {'href': href, 'users': users});
  }
  /**
   * Creates a new ticket.
   * @param ticket The ticket to create.
   */
  createTicket(ticket: Ticket) {
    ticket.courseId = this.courseId;
    this.send('/websocket/classroom/ticket/create', ticket);
  }
  /**
   * Updates an existing ticket.
   * @param ticket The ticket to update.
   */
  updateTicket(ticket: Ticket) {
    this.send('/websocket/classroom/ticket/update', ticket);
  }
  /**
   * Removes an existing ticket.
   * @param ticket The ticket to remove.
   */
  removeTicket(ticket: Ticket) {
    this.send('/websocket/classroom/ticket/remove', ticket);
  }

  private handleInviteMsg(msg: Message) {
    this.invitations.next(JSON.parse(msg.body));
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
    return {'Auth-Token': this.user.getPlainToken()};
  }
  private send(topic: string, body: {}): void {
    this.stompRx.send(topic, body, this.constructHeaders());
  }
  private listen(topic: string): Observable<Message> {
    return this.stompRx.subscribeToTopic(topic, this.constructHeaders());
  }
}
