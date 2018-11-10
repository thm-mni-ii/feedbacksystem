import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }


  login(username: string, password: string) {
    //TODO: Implement login
  }


  logout() {
    //TODO: Implement logout
  }

}
