import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CheckerConfig} from "../model/CheckerConfig";

@Injectable({
  providedIn: 'root'
})
export class CheckerService {
  constructor(private http: HttpClient) { }

  /**
   * Get a list of configured checkers
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds with the configured Checker
   */
  public getChecker(cid: number, tid: number): Observable<CheckerConfig[]> {
    return this.http.get<CheckerConfig[]>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations`)
  }

  /**
   * Create a new checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param file the file to upload
   * @return the created Checker Configuration
   */
  public createChecker(cid: number, tid: number, file: String): Observable<CheckerConfig> {
    return this.http.post<CheckerConfig>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations`,file)
  }

  /**
   * Update an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param file the file to upload
   * @return Observable that succeeds with the configured Checker
   */
  public updateChecker(cid: number, tid: number, ccid: number, file: File): Observable<CheckerConfig> {
    return this.http.put<CheckerConfig>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`, file)
  }

  /**
   * Deletes an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds if the Checker does not exists after this operation.
   */
  public deleteChecker(cid: number, tid: number, ccid: number): Observable<CheckerConfig> {
    return this.http.delete<CheckerConfig>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`)
  }

  /**
   * Get the main file of the configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public getMainFile(cid: number, tid: number, ccid: number): Observable<String | File> {
    return this.http.get<String | File>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/main-file`)
  }

  /**
   * Update main file of an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param file the file to upload
   * @return Observable that succeeds with the upload of the main file
   */
  public updateMainFile(cid: number, tid: number, ccid: number, file: File): Observable<void> {
    return this.http.put<void>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/main-file`, file)
  }

  /**
   * Get secondary file of checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds with the secondary File of configured Checker
   */
  public getSecondaryFile(cid: number, tid: number, ccid: number): Observable<String | File> {
    return this.http.get<String | File>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/secondary-file`)
  }

  /**
   * Update secondary file of an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param file the file to upload
   * @return Observable that succeeds with the upload of the file
   */
  public updateSecondaryFile(cid: number, tid: number, ccid: number, file: File): Observable<void> {
    return this.http.put<void>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/secondary-file`, file)
  }
}
