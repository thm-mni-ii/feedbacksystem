import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   *  Service to fetch data from the database
   */


  constructor(private http: HttpClient) {
  }


  getUser() {
    this.http.get('/api/v1/users').forEach(value => console.log(value));
  }
}
