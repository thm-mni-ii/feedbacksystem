import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { CheckerConfig } from "../model/CheckerConfig";
import { saveAs as importedSaveAs } from "file-saver";
import { map } from "rxjs/operators";
import { CheckerFileType } from "../enums/checkerFileType";

@Injectable({
  providedIn: "root",
})
export class CheckerService {
  constructor(private http: HttpClient) {}

  /**
   * Get a list of configured checkers
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds with the configured Checker
   */
  public getChecker(cid: number, tid: number): Observable<CheckerConfig[]> {
    return this.http.get<CheckerConfig[]>(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations`
    );
  }

  public checkForCheckerConfig(cid: number, tid: number): Observable<boolean> {
    return this.getChecker(cid, tid).pipe(
      map((checker) => {
        return checker.length === 0;
      })
    );
  }

  /**
   * Create a new checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param checker the to be created checker
   * @return all Checker Configurations
   */
  public createChecker(
    cid: number,
    tid: number,
    checker: CheckerConfig
  ): Observable<CheckerConfig> {
    return this.http.post<CheckerConfig>(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations`,
      checker
    );
  }

  /**
   * Update an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param checker the changed checker
   * @return Observable that succeeds with the configured Checker
   */
  public updateChecker(
    cid: number,
    tid: number,
    ccid: number,
    checker: CheckerConfig
  ): Observable<void> {
    return this.http.put<void>(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`,
      checker
    );
  }

  /**
   * Deletes an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @return Observable that succeeds if the Checker does not exists after this operation.
   */
  public deleteChecker(
    cid: number,
    tid: number,
    ccid: number
  ): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}`
    );
  }

  /**
   * Download the main file of the configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param checkerFileType File Type as enum
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public getFile(
    cid: number,
    tid: number,
    ccid: number,
    checkerFileType: CheckerFileType
  ) {
    this.fetchFileWithHeaders(cid, tid, ccid, checkerFileType).subscribe(
      (response) => {
        const fileName = response.headers
          .get("content-disposition")
          .split(";")[1]
          .split("=")[1];
        importedSaveAs(response.body, fileName);
      }
    );
  }

  /**
   * Fetch the main file of the configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param fType File Type as enum
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public fetchFile(
    cid: number,
    tid: number,
    ccid: number,
    fType: CheckerFileType
  ): Observable<Blob> {
    return this.http.get(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/${fType}`,
      { responseType: "blob" }
    );
  }

  /**
   * Fetch the main file of the configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param fType File Type as enum
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public fetchFileWithHeaders(
    cid: number,
    tid: number,
    ccid: number,
    fType: CheckerFileType
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/${fType}`,
      { responseType: "blob", observe: "response" }
    );
  }

  /**
   * Update main file of an existing checker configuration
   * @param cid Course id
   * @param tid Task id
   * @param ccid Checker Configuration id
   * @param fType File Type as enum
   * @param file the file to upload
   * @return Observable that succeeds with the upload of the main file
   */
  public updateFile(
    cid: number,
    tid: number,
    ccid: number,
    fType: CheckerFileType,
    file: File
  ): Observable<void> {
    return this.uploadFile(
      file,
      `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/${fType}`
    );
  }

  private uploadFile(file: File, url: string): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("file", file);
    return this.http.put<void>(url, formData);
  }
}
