import { Injectable } from '@angular/core';
import {User} from '../model/User';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  /**
   * Get a list of all users of the system.
   * @return Observable containing all users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/v1/users');
  }

  /**
   * Requests the creation of a new user
   * @param user The user
   * @return Observable that succeeds if the user is created
   */
  createUser(user: User): Observable<void> {
    return this.http.post<void>('/api/v1/users', user);
  }

  /**
   * Get a user by its id
   * @param uid User id
   */
  getUser(uid: number): Observable<User> {
    return this.http.get<User>(`/api/v1/users/${uid}`);
  }

  /**
   * Delete a user
   * @param uid The user id
   */
  deleteUser(uid: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${uid}`);
  }

  /**
   * Sets a user password for a user
   * @param uid The user id
   * @param passwd Password
   * @param passwdRepeat Same password
   */
  changePassword(uid: number, passwd: String, passwdRepeat: String): Observable<any> {
    return this.http.put<void>(`/api/v1/users/${uid}/passwd`, {
      passwd: passwd,
      passwdRepeat: passwdRepeat
    });
  }

  /**
   * Changes the global role of a user.
   * @param uid User id
   * @param roleName Either ADMIN, MODERATOR, or USER
   */
  changeRole(uid: number, roleName: string): Observable<any> {
    return this.http.put<void>(`/api/v1/users/${uid}/global-role`, {
      roleName: roleName
    });
  }
}
