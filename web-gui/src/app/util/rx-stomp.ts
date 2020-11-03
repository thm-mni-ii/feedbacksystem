import {Client, CompatClient, Frame, IMessage, Stomp} from '@stomp/stompjs';
import {Observable} from 'rxjs';
import * as SockJS from 'sockjs-client';


/**
 * A brief wrapper that wraps the stomp client into observables.
 *
 * @author Andrej Sajenko
 */
export class RxStompClient {
  private client: Client;

  /**
   * Create a stomp client over a sockjs websocket.
   * @param uri The Endpoint of the websocket server.
   */
  public constructor(uri: string, connectHeaders) {
    this.client = new Client({webSocketFactory: () => new WebSocket(uri), connectHeaders: connectHeaders, reconnectDelay: 10000})
  }
  /**
   * @return True if client is connected.
   */
  public isConnected() {
    return this.client.connected;
  }

  /**
   * Establish a connection to a stomp protocol server.
   * @param headers Optional headers to send with the connection frame.
   */
  public connect() {
    this.client.activate();
    this.client.onWebSocketError = e => console.log(e);
    this.client.onStompError = e => console.log(e);
  }

  /**
   * On Connect Callabck
   * @param cb Callback to be called when the client is connected
   */
  public onConnect(cb) {
    this.client.onConnect = cb;
  }
  /**
   * Subscribe to a topic to listen to messages over this topic.
   * @param topic The topic to listen to.
   * @param headers Optional headers.
   */
  public subscribeToTopic(topic: string, headers: {} = {}): Observable<IMessage> {
    return new Observable((subj) => {
      this.client.subscribe(topic, (msg: IMessage) => {
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
    this.client.publish({destination:path , headers:headers, body: JSON.stringify(body)});
  }

  /**
   * Diconnects from the websocket stream.
   * @param headers Optional headers
   */
  public disconnect() {
    this.client.deactivate();
  }
}
