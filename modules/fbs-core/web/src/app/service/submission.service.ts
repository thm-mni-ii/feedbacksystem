import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Submission } from "../model/Submission";
import { HttpClient } from "@angular/common/http";
import { SubTaskResult } from "../model/SubTaskResult";

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
    sid: number
  ): Observable<void> {
    return this.http.put<void>(
      `/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}`,
      {}
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
    additionalInformation?: Record<string, any>
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

  emitFileSubmission(): void {
    this.isFileSubmitted.emit(true);
  }

  getFileSubmissionEmitter(): EventEmitter<boolean> {
    return this.isFileSubmitted;
  }
}
