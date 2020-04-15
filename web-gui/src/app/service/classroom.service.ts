import {Injectable} from '@angular/core';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
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
  private users: Subject<User[]>;
  private tickets: Subject<Ticket[]>;
  private invitations: Subject<ConfInvite>;

  private courseId = 0;
  private stompRx: RxStompClient = null;

  public constructor(private user: UserService) {
    this.users = new BehaviorSubject<User[]>([]);
    this.tickets = new BehaviorSubject<Ticket[]>([]);
    this.invitations = new Subject<ConfInvite>();
  }

  /**
   * @return Users of the connected course.
   */
  public getUsers(): Observable<User[]> {
    return this.users.asObservable();
  }
  /**
   * @return Tickets of the connected course.
   */
  public getTickets(): Observable<Ticket[]> {
    return this.tickets.asObservable();
  }
  /**
   * @return Get invitations to take part in a conference
   */
  public getInvitations(): Observable<ConfInvite> {
    return this.invitations.asObservable();
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
  public join(courseId: number): Observable<void> {
    this.courseId = courseId;
    this.stompRx = new RxStompClient('https://localhost:8080/websocket');

    return new Observable<void>(c => {
      this.stompRx.connect(this.constructHeaders()).subscribe(_ => {

        // Handles invitation from tutors / docents to take part in a webconference
        this.listen('/user/' + this.user.getUsername() + '/classroom/invite').subscribe(m => this.handleInviteMsg(m));
        this.listen('/user/' + this.user.getUsername() + '/classroom/users').subscribe(m => this.handleUsersMsg(m));
        this.listen( '/topic/classroom/' + this.courseId + '/left').subscribe(m => this.requestUsersUpdate());
        this.listen( '/topic/classroom/' + this.courseId + '/joined').subscribe(m => this.requestUsersUpdate());
        this.requestUsersUpdate();
        this.listen('/topic/classroom/' + this.courseId + '/tickets').subscribe(m => this.handleTicketsMsg(m));
        this.listen('/topic/classroom/' + this.courseId + '/ticket/create').subscribe(m => this.requestTicketsUpdate());
        this.listen('/topic/classroom/' + this.courseId + '/ticket/update').subscribe(m => this.requestTicketsUpdate());
        this.listen('/topic/classroom/' + this.courseId + '/ticket/remove').subscribe(m => this.requestTicketsUpdate());
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
  public leave(): Observable<void> {
    return this.stompRx.disconnect(this.constructHeaders());
  }

  /**
   * Invites user to a conference by following the link provided as href.
   * @param href The link of the conference server
   * @param users The users to invite
   */
  public inviteToConference(href: string, users: {username: string; prename: string; surname: string}[]) {
    this.send('/websocket/classroom/invite', {'href': href, 'users': users});
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
