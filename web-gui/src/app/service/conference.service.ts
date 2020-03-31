import {Injectable} from "@angular/core";
import {ConferenceDetails} from "../interfaces/HttpInterfaces";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  constructor(private http: HttpClient) {
  }

  getConferences(courseId: number): Observable<string[]> {
    return this.http.get<string[]>("/api/v1/courses/" + courseId + "/conferences")
  }

  createConferences(courseId: number, countOfConferences: number): Observable<any> {
    return this.http.post("/api/v1/courses/" + courseId + "/conferences", {
      count: countOfConferences
    });
  }
}
