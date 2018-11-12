import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";

/**
 * Service that manages login and logout for an user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }


  login(username: string, password: string) {
    this.http.post("/api/v1/login", {},
      {params: new HttpParams().append("username", username).append("password", password)}).subscribe(data => {

        //TODO: Save usertoken
        console.log(data);
    })
  }


  logout() {
    //TODO: Implement logout
  }

}
