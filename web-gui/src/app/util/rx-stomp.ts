import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import {Observable} from 'rxjs';

/**
 * A brief wrapper that wraps the stomp client into observables.
 *
 * @author Andrej Sajenko
 */
export class RxStompClient {
  private client: Stomp.Client;

  /**
   * Create a stomp client over a sockjs websocket.
   * @param uri The Endpoint of the websocket server.
   */
  public constructor(uri: string) {
    const socket = new SockJS(uri);
    this.client = Stomp.over(socket);
  }

  /**
   * Establish a connection to a stomp protocol server.
   * @param headers Optional headers to send with the connection frame.
   */
  public connect(headers: {} = {}): Observable<Stomp.Frame> {
    return new Observable((subj) => {
      this.client.connect(headers, frame => {
        subj.next(frame);
        subj.complete();
      }, error => subj.error(error));
    });
  }

  /**
   * Subscribe to a topic to listen to messages over this topic.
   * @param topic The topic to listen to.
   * @param headers Optional headers.
   */
  public subscribeToTopic(topic: string, headers: {} = {}): Observable<Stomp.Message> {
    return new Observable((subj) => {
      this.client.subscribe(topic, (msg: Stomp.Message) => {
        subj.next(msg);
      }, headers);
    });
  }

  /**
   * Send a message to a path, i.e., topic.
   * @param path Path, i.e., topic of the message.
   * @param body Optional body to send to the path (object is stringified before sending it).
   * @param headers Optional headers.
   */
  public send(path: string, body: {} = {}, headers: {} = {}): any {
    this.client.send(path, headers, JSON.stringify(body));
  }

  /**
   * Diconnects from the websocket stream.
   * @param headers Optional headers
   */
  public disconnect(headers: {} = {}): Observable<any> {
    return new Observable((subj) => {
      this.client.disconnect(() => {
        subj.next();
        subj.complete();
      }, headers);
    });
  }
}
