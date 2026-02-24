import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Participant } from "../model/Participant";
import { Group } from "../model/Group";

@Injectable({
  providedIn: "root",
})
export class GroupRegistrationService {
  constructor(private http: HttpClient) {}

  /**
   * @param uid User id
   * @return All registered groups
   */
  getRegisteredGroups(uid: number): Observable<Group[]> {
    return this.http.get<Group[]>(`/api/v1/users/${uid}/groups`);
  }

  /**
   * @param cid Course id
   * @param gid Group id
   * @return All participants of the group
   */
  getGroupParticipants(cid: number, gid: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(
      `/api/v1/courses/${cid}/groups/${gid}/participants`
    );
  }

  /**
   * Register a user into a group
   * @param cid Course id
   * @param gid Group id
   * @param uid User id
   * @return Observable that succeeds on successful registration
   */
  registerGroup(cid: number, gid: number, uid: number): Observable<void> {
    return this.http.put<void>(
      `/api/v1/courses/${cid}/groups/${gid}/users/${uid}`,
      {}
    );
  }

  /**
   * De-register a user from a group
   * @param cid Course id
   * @param gid Group id
   * @param uid User id
   */
  deregisterGroup(cid: number, gid: number, uid: number): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${cid}/groups/${gid}/users/${uid}`
    );
  }

  /**
   * De-register all users from a course
   * @param cid Course id
   * @param gid Group id
   */
  deregisterAll(cid: number, gid: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${cid}/groups/${gid}/users`);
  }

  /**
   *  Get current number of members of a group
   *  @param cid Course id
   *  @param gid Group id
   *  @return Number of members
   */
  getGroupMembership(cid: number, gid: number): Observable<number> {
    return this.http.get<number>(
      `/api/v1/courses/${cid}/groups/${gid}/membership`
    );
  }
}
