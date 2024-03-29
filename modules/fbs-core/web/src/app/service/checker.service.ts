import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
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
   * @param fType File Type as enum
   * @return Observable that succeeds with the Main File of configured Checker
   */
  public getFile(
    cid: number,
    tid: number,
    ccid: number,
    fType: CheckerFileType,
    filename: string
  ) {
    //replace all illegal file characters with underscore
    filename = filename.replace(/[~"#%&*:<>?/\\{|}. ]+/g, "_");
    let fExtension: string;
    switch (fType) {
      case "main-file":
        fExtension = "_config.txt";
        break;
      case "secondary-file":
        fExtension = "_secondary.txt";
        break;
      default:
        fExtension = ".txt";
        break;
    }

    this.fetchFile(cid, tid, ccid, fType).subscribe((response) => {
      const blob = new Blob([response], { type: "text/plain" });

      importedSaveAs(blob, filename + fExtension);
    });
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
    return this.http
      .get(
        `/api/v1/courses/${cid}/tasks/${tid}/checker-configurations/${ccid}/${fType}`,
        { responseType: "arraybuffer" }
      )
      .pipe(
        map(
          (response) =>
            new Blob([response], { type: "application/octet-stream" })
        )
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
    // let headers = new HttpHeaders({
    //   'Content-Type': ''
    // });
    return this.http.put<void>(url, formData);
  }
}
