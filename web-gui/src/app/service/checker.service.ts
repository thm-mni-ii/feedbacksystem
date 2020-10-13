import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CheckerConfig} from "../model/CheckerConfig";
import {saveAs as importedSaveAs} from "file-saver";

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
   * @param checker the to be created checker
   * @return all Checker Configurations
   */
  public createChecker(cid: number, tid: number, checker: CheckerConfig): Observable<CheckerConfig> {
    return this.http.post<CheckerConfig>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations`, checker)
  }

  /**
   * Update an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param checker the changed checker
   * @return Observable that succeeds with the configured Checker
   */
  public updateChecker(cid: number, tid: number, ccid: number, checker: CheckerConfig): Observable<void> {
    return this.http.put<void>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`, checker)
  }

  /**
   * Deletes an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds if the Checker does not exists after this operation.
   */
  public deleteChecker(cid: number, tid: number, ccid: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`)
  }

  /**
   * Get the main file of the configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public getMainFile(cid: number, tid: number, ccid: number) {
    this.http.get(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/main-file`,{responseType: 'arraybuffer'})
      .subscribe(response => {
        const blob = new Blob([response], {type: 'text/plain'});
        importedSaveAs(blob);
      });
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
    return this.uploadFile(file,`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/main-file`)
  }

  /**
   * Get secondary file of checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds with the secondary File of configured Checker
   */
  public getSecondaryFile(cid: number, tid: number, ccid: number){
    return this.http.get(`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/secondary-file`, {responseType: 'arraybuffer'})
      .subscribe(response => {
        const blob = new Blob([response], {type: 'text/plain'});
        importedSaveAs(blob);
      });
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
    return this.uploadFile(file,`/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/secondary-file`)
  }

  private uploadFile(file: File, url: string): Observable<void>{
    let formData:FormData = new FormData();
    formData.append('file', file);
    // let headers = new HttpHeaders({
    //   'Content-Type': ''
    // });
    return this.http.put<void>(url, formData)
  }
}
