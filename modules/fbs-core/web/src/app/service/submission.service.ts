import { HttpClient, HttpParams } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SubTaskResult } from "../model/SubTaskResult";
import { Submission } from "../model/Submission";

@Injectable({
  providedIn: "root",
})
export class SubmissionService {
  private isFileSubmitted: EventEmitter<boolean>;

  constructor(private http: HttpClient) {
    this.isFileSubmitted = new EventEmitter<boolean>();
  }

  /**
   * Load all submission for a task
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param passed Filters only passed submissions
   * @return Observable that succeeds with all submission of a user for a task
   */
  getAllSubmissions(uid: number, cid: number, tid: number): Observable<any> {
    // TODO: do we need passed filter?
    return this.http.get<any>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions`
    );
  }

  /**
   * Restart an already submitted submission. The submission will be checked again
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param sid submission id
   * @return Observable that succeeds if operation submission was restated
   */
  restartSubmission(
    uid: number,
    cid: number,
    tid: number,
    sid: number,
    checkerOrders?: Array<number | string>
  ): Observable<void> {
    let params = new HttpParams();
    checkerOrders?.forEach(
      (order) => (params = params.append("checkerOrders", order.toString()))
    );
    return this.http.put<void>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}`,
      {},
      { params }
    );
  }

  /**
   * Load a single submission
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param sid submission id
   * @return Observable that succeeds with the submission
   */
  getSubmission(
    uid: number,
    cid: number,
    tid: number,
    sid: number
  ): Observable<Submission> {
    return this.http.get<Submission>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}`
    );
  }

  // POST /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  submitSolution(
    uid: number,
    cid: number,
    tid: number,
    solution: File | object | string,
    additionalInformation?: Record<string, any>,
    checkerOrders?: Array<number | string>
  ): Observable<Submission> {
    const formData: FormData = new FormData();
    let formSolution;
    if (typeof solution === "object") {
      if (solution instanceof File) {
        formSolution = solution;
      } else {
        formSolution = new Blob([JSON.stringify(solution)]);
      }
    } else if (typeof solution === "string") {
      formSolution = new Blob([solution]);
    } else {
      throw new Error("solution is of invalid type");
    }
    formData.append("file", formSolution);
    if (additionalInformation) {
      formData.append(
        "additionalInformation",
        JSON.stringify(additionalInformation)
      );
    }
    checkerOrders?.forEach((order) =>
      formData.append("checkerOrders", order.toString())
    );
    return this.http.post<Submission>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions`,
      formData
    );
  }

  // GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}/subresults
  getSubTaskResults(
    uid: number,
    cid: number,
    tid: number,
    sid: number
  ): Observable<SubTaskResult[]> {
    return this.http.get<SubTaskResult[]>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}/subresults`
    );
  }

  /**
   * Retrieves content of a submission
   * GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}/content
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param sid Submission id
   * @return Observable that succeeds with the content of a submission made from user for a task
   */
  getTaskSubmissionsContent(
    uid: number,
    cid: number,
    tid: number,
    sid: number
  ): Observable<any> {
    return this.http.get(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}/content`,
      { responseType: "text" }
    );
  }

  emitFileSubmission(): void {
    this.isFileSubmitted.emit(true);
  }

  getFileSubmissionEmitter(): EventEmitter<boolean> {
    return this.isFileSubmitted;
  }

  downloadSubmission(uid: number, cid: number, tid: number, sid: number) {
    return this.http
      .get(
        `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}/content`,
        {
          responseType: "arraybuffer",
          observe: "response",
        }
      )
      .subscribe((response) => {
        const fileName = response.headers
          .get("content-disposition")
          .split(";")[1]
          .split("=")[1];
        const type = response.headers.get("Content-Type") ?? "text/plain";

        const blob = new Blob([response.body], { type });
        saveAs(blob, fileName);
      });
  }
}
