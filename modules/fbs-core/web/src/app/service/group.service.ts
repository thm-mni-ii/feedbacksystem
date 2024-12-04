import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Group, GroupInput } from "../model/Group";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private cid: number;

  constructor(private http: HttpClient) {}
  /**
   * @return Observable with all groups
   * @param visible Optional filter to filter only for visible groups
   * @param cid The course id
   */
  getGroupList(cid: number, visible?: boolean): Observable<Group[]> {
    let url = `/api/v1/courses/${cid}/groups`;
    if (visible !== undefined) {
      url += `?visible = ${visible}`;
    }
    return this.http.get<Group[]>(url);
  }

  /**
   * Get a single group by its id, if it exits
   * @param cid The course id
   * @param gid The group id
   */
  getGroup(cid: number, gid: number): Observable<Group> {
    return this.http.get<Group>(`/api/v1/courses/${cid}/groups/${gid}`);
  }

  /**
   * Create a new group
   * @param cid The course id
   * @param postData The necessary input to create a group
   * @return The created group, adjusted by the system
   */
  createGroup(cid: number, postData: GroupInput): Observable<Group> {
    const groupData = { ...postData, courseId: cid };
    return this.http.post<Group>(`/api/v1/courses/${cid}/groups`, groupData);
  }

  /**
   * Update an existing group
   * @param cid The course id
   * @param gid The group id
   * @param postData The necessary input to create a group
   */
  updateGroup(
    cid: number,
    gid: number,
    postData: GroupInput
  ): Observable<void> {
    const groupData = { ...postData, courseId: cid };
    return this.http.put<void>(
      `/api/v1/courses/${cid}/groups/${gid}`,
      groupData
    );
  }

  /**
   * Delete a group by its id
   * @param cid The course id
   * @param gid The group id
   * @return Observable that succeeds if the course does not exist after the operation
   */
  deleteGroup(cid: number, gid: number): Observable<void> {
    // returns an Observable<Succeeded>
    return this.http.delete<void>(`/api/v1/courses/${cid}/groups/${gid}`);
  }
}
