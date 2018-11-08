import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }


  login(username: string, password: string) {
    this.http.post("/api/v1/login", {username: username, password: password}).forEach(value => console.log(value))
  }


  logout() {

  }

}
